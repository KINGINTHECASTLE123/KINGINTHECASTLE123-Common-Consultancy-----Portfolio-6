const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());

// MySQL database connection
const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
});

// Test database connection
connection.connect(err => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the MySQL database.");
    }
});

// Interactive Map (Visualizations nr.3)
app.get("/api/mapdata", (req, res) => {
    const query = `
        SELECT 
            s.country AS country,
            SUM(CASE WHEN c.gpt_ukraine_for_imod = 'for' THEN 1 ELSE 0 END) AS total_for,
            SUM(CASE WHEN c.gpt_ukraine_for_imod = 'imod' THEN 1 ELSE 0 END) AS total_imod,
            COUNT(*) AS total_posts
        FROM metrics m
        JOIN sourcepop s ON m.ccpageid = s.ccpageid
        JOIN classification c ON m.ccpost_id = c.ccpost_id
        GROUP BY s.country;
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query Error:", err);
            res.status(500).send({ error: "Database query failed" });
        } else {
            res.json(results);
        }
    });
});

// Interactive Chart nr. 2
app.get("/api/timeseries", (req, res) => {
    const query = `
        SELECT t.year, CONCAT('Q', CEIL(t.month / 3)) AS quarter,
            AVG(
                CASE 
                    WHEN c.gpt_ukraine_for_imod = 'for' THEN 1
                    WHEN c.gpt_ukraine_for_imod = 'imod' THEN -1
                    ELSE 0
                END
            ) AS avg_sentiment
        FROM classification c
        JOIN time t ON c.ccpost_id = t.ccpost_id
        JOIN metrics m ON c.ccpost_id = m.ccpost_id
        JOIN sourcepop s ON m.ccpageid = s.ccpageid
        WHERE s.country = 'Denmark'
          AND t.year IN (2021, 2022, 2023, 2024)
        GROUP BY t.year, quarter
        ORDER BY t.year, quarter;
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).send({ error: "Database query failed" });
        }

        // Format results to include year, quarter, and avg_sentiment
        const formattedResults = results.map(row => ({
            year: row.year,
            quarter: row.quarter,
            avg_sentiment: row.avg_sentiment
        }));

        res.json(formattedResults);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Application is now running on port ${port}`);
});