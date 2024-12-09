const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());

// Host, user, password, database
const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
});

// Test databaseforbindelse
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the MySQL database.");
    }
});

// fetch all data from classification
app.get("/api/classification", (req, res) => {
    connection.query("SELECT * FROM classification", (err, results) => {
        if (err) {
            console.error("Query Error:", err); // Log detaljeret fejl
            res.status(500).json({ error: "Database query failed", details: err.message });
        } else {
            res.json(results);
        }
    });
});

app.get("/api/sourcepop", (req, res) => {
    connection.query("SELECT * FROM sourcepop", (err, results) => {
        if (err) {
            console.error("Query Error:", err); // Log detaljeret fejl
            res.status(500).json({ error: "Database query failed", details: err.message });
        } else {
            res.json(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Application is now running on port ${port}`);
});