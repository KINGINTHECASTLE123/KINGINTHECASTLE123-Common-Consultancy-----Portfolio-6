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

app.get("/api/classification/ukraine", (req, res) => {
    const query = `
        SELECT gpt_ukraine_for_imod AS position, COUNT(*) AS count
        FROM classification
        GROUP BY gpt_ukraine_for_imod
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query Error:", err);
            res.status(500).send({ error: "Database query failed" });
        } else {
            res.send(results);
        }
    });
});

// Endpoint til at se støtte til Ukraine over årene
app.get("/api/time/classification/ukraine", (req, res) => {
    const query = `
        SELECT year AS \`År\`, gpt_ukraine_for_imod AS \`For eller Imod\`
        FROM time
        INNER JOIN classification 
        ON time.ccpost_id = classification.ccpost_id
        WHERE gpt_ukraine_for_imod = "for" OR "imod"
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query Error:", err);
            res.status(500).send({ error: "Database query failed" });
        } else {
            res.send(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Application is now running on port ${port}`);
});
