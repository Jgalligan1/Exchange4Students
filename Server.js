const express = require("express");
const mysql = require("mysql2");
const nodemailer = require('nodemailer');
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON data

// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Voyager@Beyond", 
    database: "project1"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to MySQL");
});

// Route to add an item
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


// Route to fetch all items
app.get("/items", (req, res) => {
    db.query("SELECT * FROM items", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

// Route to update an item
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

app.post("/cart", (req, res) => {
    const { user_id, item_id } = req.body;
  
    // Step 1: Check if the user already has a cart
    const getCartSql = "SELECT id FROM carts WHERE user_id = ?";
    db.query(getCartSql, [user_id], (err, results) => {
      if (err) {
        console.error("Error checking for cart:", err);
        return res.status(500).send(err);
      }
  
      if (results.length > 0) {
        // Cart exists
        const cart_id = results[0].id;
        addToCartItems(cart_id, item_id, res);
      } else {
        // If the cart doesn't exist, create one
        const createCartSql = "INSERT INTO carts (user_id) VALUES (?)";
        db.query(createCartSql, [user_id], (err, result) => {
          if (err) {
            console.error("Error creating cart:", err);
            return res.status(500).send(err);
          }
  
          const cart_id = result.insertId;
          addToCartItems(cart_id, item_id, res);
        });
      }
    });
  });
  
  // Helper function to add item to cart_items
  function addToCartItems(cart_id, item_id, res) {
    const insertItemSql = "INSERT INTO cart_items (cart_id, item_id) VALUES (?, ?)";
    db.query(insertItemSql, [cart_id, item_id], (err, result) => {
      if (err) {
        console.error("Error adding item to cart_items:", err);
        return res.status(500).send(err);
      }
      res.json({ message: "Item added to cart successfully." });
    });
  }
  

// Get all items in user's cart
app.get("/cart/:user_id", (req, res) => {
    const { user_id } = req.params;

    const sql = `
        SELECT items.*
        FROM cart_items
        JOIN carts ON cart_items.cart_id = carts.id
        JOIN items ON cart_items.item_id = items.id
        WHERE carts.user_id = ?
    `;
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


// Route to clear user's cart
app.delete("/cart/:user_id", (req, res) => {
  const { user_id } = req.params;

  // Find the cart_id
  const findCartSql = "SELECT id FROM carts WHERE user_id = ?";
  db.query(findCartSql, [user_id], (err, results) => {
      if (err) {
          console.error("Error finding cart:", err);
          return res.status(500).send(err);
      }

      if (results.length === 0) {
          // No cart found for user
          return res.status(404).json({ message: "Cart not found for user." });
      }

      const cart_id = results[0].id;

      // Delete all items from cart_items for that cart_id
      const deleteItemsSql = "DELETE FROM cart_items WHERE cart_id = ?";
      db.query(deleteItemsSql, [cart_id], (err, result) => {
          if (err) {
              console.error("Error clearing cart:", err);
              return res.status(500).send(err);
          }

          res.json({ message: "Cart cleared successfully." });
      });
  });
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

//BELOW HERE IS THE CHECKOUT FUNCTIONALITY.  IT IS NOT BUILT FOR EXPANSION YET

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
      if (err) {
          console.error("Error loading notifications:", err);
          return res.status(500).json({ error: "Database error" });
      }
      res.json(results);
  });
});

app.post("/checkout", (req, res) => {
  const userId = req.body.user_id;

  if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
  }

  // Step 1: Get cart ID
  const cartQuery = "SELECT id FROM carts WHERE user_id = ?";
  db.query(cartQuery, [userId], (err, cartResults) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (cartResults.length === 0) return res.status(404).json({ error: "Cart not found" });

      const cartId = cartResults[0].id;

      // Step 2: Get cart items
      const cartItemsQuery = "SELECT item_id FROM cart_items WHERE cart_id = ?";
      db.query(cartItemsQuery, [cartId], (err, items) => {
          if (err) return res.status(500).json({ error: "Database error" });
          if (items.length === 0) return res.status(400).json({ error: "Cart is empty" });

          // Step 3: Calculate total price (could fetch prices here if needed, for now assume $0)
          let totalAmount = 0; // Simplified for now — you can improve later

          // Step 4: Create order
          const createOrderQuery = "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)";
          db.query(createOrderQuery, [userId, totalAmount], (err, orderResult) => {
              if (err) return res.status(500).json({ error: "Database error" });

              const orderId = orderResult.insertId;

              // Step 5: Insert order_items
              const orderItemsValues = items.map(item => [orderId, item.item_id]);
              const insertOrderItemsQuery = "INSERT INTO order_items (order_id, item_id) VALUES ?";
              db.query(insertOrderItemsQuery, [orderItemsValues], (err) => {
                  if (err) return res.status(500).json({ error: "Database error inserting order items" });

                  // Step 6: Clear cart
                  const clearCartQuery = "DELETE FROM cart_items WHERE cart_id = ?";
                  db.query(clearCartQuery, [cartId], (err) => {
                      if (err) return res.status(500).json({ error: "Database error clearing cart" });

                      res.json({ message: "Checkout successful" });
                  });
              });
          });
      });
  });
});
