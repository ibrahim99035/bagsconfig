// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Specify the path for the database file
const dbPath = path.resolve(__dirname, 'fabric_data.db');

// Create or open the database file
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS fabric_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        height REAL,
        width REAL,
        bottomSpace REAL,
        quantity INTEGER,
        colorCount INTEGER,
        mainColor TEXT,
        handAttachment TEXT,
        printingMethod TEXT,
        area REAL,
        weight REAL,
        costPrice REAL,
        sellingPrice REAL,
        coloringAndPrintingCost REAL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
});

module.exports = db;
