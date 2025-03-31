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
    password: "Voyager@Beyond", // Th
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
    const { type, name, price, description, color, size, user_id, weight, dimension } = req.body;
    const sql = "INSERT INTO items (type, name, price, description, color, size, user_id, weight, dimension) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [type, name, price, description, color, size, user_id, weight, dimension];

    db.query(sql, values, (err, result) => {
        if (err) return res.status(500).send(err);
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

// Start the server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
