const express = require("express");
const db = require("./db");
require("dotenv").config();

const app = express();
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

// Database test route
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
