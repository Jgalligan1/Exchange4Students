const express = require("express");
const mysql = require("mysql2");
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
            console.error("Error inserting item:", err); // Optional: log more details
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


// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
