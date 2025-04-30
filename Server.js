const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serves HTML/CSS/JS from root
app.use('/auth', require('./routes/auth'));

// Connect to MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Voyager@Beyond",
  database: "project1"
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL");
});

// Routes (auth must come early)
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// ============ Item Routes ============

// Add item
app.post("/add-item", (req, res) => {
  const { type, name, price, description, color, size, user_id, weight, dimension, model, course_number, edition } = req.body;
  const sql = "INSERT INTO items (type, name, price, description, color, size, user_id, weight, dimension, model, course_number, edition) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [type, name, price, description, color, size, user_id, weight, dimension, model, course_number, edition];
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting item:", err);
      return res.status(500).send(err);
    }
    res.json({ message: "Item added successfully", id: result.insertId });
  });
});

// Fetch items
app.get("/items", (req, res) => {
  db.query("SELECT * FROM items", (err, results) => {
    if (err) return res.status(500).json({ message: "Server error fetching items." });
    res.json(results);
  });
});

// Update item
app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const { type, name, price, description, color, size, user_id, weight, dimension, model, course_number, edition } = req.body;

  const sql = `
      UPDATE items 
      SET type = ?, name = ?, price = ?, description = ?, color = ?, size = ?, user_id = ?, weight = ?, dimension = ?, model = ?, course_number = ?, edition = ?
      WHERE id = ?
  `;
  const values = [type, name, price, description, color, size, user_id, weight, dimension, model, course_number, edition, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating item:", err);
      return res.status(500).send(err);
    }
    res.json({ message: "Item updated successfully" });
  });
});

// Delete item
app.delete("/items/:item_id", (req, res) => {
  const { item_id } = req.params;

  const deleteOrderItemsSql = "DELETE FROM order_items WHERE item_id = ?";
  db.query(deleteOrderItemsSql, [item_id], (err) => {
    if (err) return res.status(500).send(err);

    const deleteItemSql = "DELETE FROM items WHERE id = ?";
    db.query(deleteItemSql, [item_id], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Item not found." });
      res.json({ message: "Item and its references deleted successfully." });
    });
  });
});

// Get all items posted by the logged-in user
app.get("/user-items/:email", (req, res) => {
  const email = req.params.email;

  const sql = `
    SELECT items.*
    FROM items
    JOIN users ON items.user_id = users.id
    WHERE users.email = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Cart logic
app.post("/cart", (req, res) => {
  const { user_id, item_id } = req.body;
  const getCartSql = "SELECT id FROM carts WHERE user_id = ?";

  db.query(getCartSql, [user_id], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length > 0) {
      addToCartItems(results[0].id, item_id, res);
    } else {
      const createCartSql = "INSERT INTO carts (user_id) VALUES (?)";
      db.query(createCartSql, [user_id], (err, result) => {
        if (err) return res.status(500).send(err);
        addToCartItems(result.insertId, item_id, res);
      });
    }
  });
});

function addToCartItems(cart_id, item_id, res) {
  const sql = "INSERT INTO cart_items (cart_id, item_id) VALUES (?, ?)";
  db.query(sql, [cart_id, item_id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Item added to cart successfully." });
  });
}

// Get cart items
app.get("/cart/:user_id", (req, res) => {
  const sql = `
      SELECT items.*
      FROM cart_items
      JOIN carts ON cart_items.cart_id = carts.id
      JOIN items ON cart_items.item_id = items.id
      WHERE carts.user_id = ?
  `;
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Clear cart
app.delete("/cart/:user_id", (req, res) => {
  const sql = "SELECT id FROM carts WHERE user_id = ?";
  db.query(sql, [req.params.user_id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ message: "Cart not found for user." });

    const cart_id = results[0].id;
    db.query("DELETE FROM cart_items WHERE cart_id = ?", [cart_id], (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Cart cleared successfully." });
    });
  });
});

// Notifications route
app.get("/notifications", (req, res) => {
  const sql = `
    SELECT 
        items.name AS item_name,
        users.email AS buyer_email
    FROM order_items
    JOIN orders ON order_items.order_id = orders.id
    JOIN users ON orders.user_id = users.id
    JOIN items ON order_items.item_id = items.id
    ORDER BY orders.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(results);
  });
});

// Checkout route
app.post("/checkout", (req, res) => {
  const userId = req.body.user_id;
  if (!userId) return res.status(400).json({ error: "User ID is required" });

  db.query("SELECT id FROM carts WHERE user_id = ?", [userId], (err, cartResults) => {
    if (err || cartResults.length === 0) return res.status(404).json({ error: "Cart not found" });

    const cartId = cartResults[0].id;
    db.query("SELECT item_id FROM cart_items WHERE cart_id = ?", [cartId], (err, items) => {
      if (err || items.length === 0) return res.status(400).json({ error: "Cart is empty" });

      const totalAmount = 0;
      db.query("INSERT INTO orders (user_id, total_amount) VALUES (?, ?)", [userId, totalAmount], (err, orderResult) => {
        if (err) return res.status(500).json({ error: "Database error" });

        const orderId = orderResult.insertId;
        const orderItemsValues = items.map(item => [orderId, item.item_id]);
        db.query("INSERT INTO order_items (order_id, item_id) VALUES ?", [orderItemsValues], (err) => {
          if (err) return res.status(500).json({ error: "Error inserting order items" });

          db.query("DELETE FROM cart_items WHERE cart_id = ?", [cartId], (err) => {
            if (err) return res.status(500).json({ error: "Error clearing cart" });
            res.json({ message: "Checkout successful" });
          });
        });
      });
    });
  });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "LoginScreen.html"));
  });

// ✅ Start the server
app.listen(PORT, () => {
  console.log("✔ Auth routes loaded");
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log("Connected to MySQL");
});

