const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv").config();

const app = express();
const port = 3000;

app.use(cors());

// Establish MySQL database connection
const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
});

// Test the database connection
connection.connect(err => {
    if (err) {
        console.error("Error connecting to the database:", err);
    } else {
        console.log("Connected to the MySQL database.");
    }
});

// API for Bar Chart Data (Visualization 1)
// Calculates positive and negative sentiment percentages grouped by country
app.get("/api/sentiment/percentages", (req, res) => {
    const query = `
        SELECT country,
        ROUND(SUM(gpt_ukraine_for_imod = 'for') * 100 / COUNT(*)) AS positive_percentage,
        ROUND(SUM(gpt_ukraine_for_imod = 'imod') * 100 / COUNT(*)) AS negative_percentage
        FROM sourcepop
        INNER JOIN metrics ON metrics.ccpageid = sourcepop.ccpageid
        INNER JOIN classification ON classification.ccpost_id = metrics.ccpost_id
        WHERE gpt_ukraine_for_imod IN ('for', 'imod')
        GROUP BY country
        ORDER BY positive_percentage DESC;
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query Error:", err);
            res.status(500).send({ error: "Database query failed" });
        }
        // Format results into separate arrays for response
        const response = { country: [], positive_percentage: [] };
        results.forEach(row => {
            response.country.push(row.country);
            response.positive_percentage.push(row.positive_percentage);
        });
        res.json(response);
    });
});

// API for Line Chart Data (Visualization 2)
// Returns quarterly average sentiment for Ukraine in Denmark
app.get("/api/support_over_yearquarters", (req, res) => {
    const query = `
        SELECT t.year, t.yearquarter,
               ROUND(
                       (COUNT(CASE WHEN c.gpt_ukraine_for_imod = 'for' THEN 1 END) * 100.0)
                           / COUNT(*), 2
               ) AS avg_sentiment
        FROM classification c
                 JOIN time t ON c.ccpost_id = t.ccpost_id
                 JOIN metrics m ON c.ccpost_id = m.ccpost_id
                 JOIN sourcepop s ON m.ccpageid = s.ccpageid
        WHERE s.country = 'Denmark'
          AND t.year IN (2022, 2023, 2024)
          AND c.gpt_ukraine_for_imod IN ('for', 'imod')
        GROUP BY t.year, t.yearquarter
        ORDER BY t.year, t.yearquarter;
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error("Query Error:", err);
            return res.status(500).send({ error: "Database query failed" });
        }
        // Format yearquarter til year og quarter for responsen
        const formattedResults = results.map(row => {
            const [year, quarter] = row.yearquarter.split('Q');
            return {
                year: parseInt(year),
                quarter: parseInt(quarter),
                avg_sentiment: parseFloat(row.avg_sentiment)
            };
        });
        res.json(formattedResults);
    });
});

// API for Line Chart Data (Visualization 3)
// Returns total interactions per quarter starting from 2022Q1
app.get('/api/total_interactions_over_year', (req, res) => {
    const query = `
    SELECT yearquarter AS year_quarter, SUM(total_interactions) AS total_interactions
    FROM \`time\`
    INNER JOIN metrics ON metrics.ccpost_id = \`time\`.ccpost_id
    WHERE yearquarter >= "2022Q1"
    GROUP BY yearquarter
    ORDER BY yearquarter ASC;
    `;
    connection.query(query, (error, results) => {
        if (error) {
            console.error("Query Error:", error);
            return res.status(500).send({ error: "Database query failed" });
        }
        // Format results for response
        const response = { year_quarter: [], total_interactions: [] };
        results.forEach(row => {
            const formattedYearQuarter = row.year_quarter.slice(0, 4) + ' ' + row.year_quarter.slice(4);
            response.year_quarter.push(formattedYearQuarter);
            response.total_interactions.push(row.total_interactions);
        });
        res.json(response);
    });
});

// API for Map Data (Visualization 4)
// Returns total "for" and "imod" sentiment counts grouped by country
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

// Start the server
app.listen(port, () => {
    console.log(`Application is now running on port ${port}`);
});
