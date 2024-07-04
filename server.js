const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const db = require('./database');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to handle form submission
app.post('/submit', (req, res) => {
    const {
        height, width, bottomSpace, quantity,
        colorCount, mainColor, handAttachment,
        printingMethod, area, weight,
        costPrice, sellingPrice, coloringAndPrintingCost
    } = req.body;

    const stmt = db.prepare(`INSERT INTO fabric_data (
        height, width, bottomSpace, quantity, colorCount,
        mainColor, handAttachment, printingMethod,
        area, weight, costPrice, sellingPrice, coloringAndPrintingCost
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    stmt.run(
        height, width, bottomSpace, quantity, colorCount,
        mainColor, handAttachment, printingMethod,
        area, weight, costPrice, sellingPrice, coloringAndPrintingCost,
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, id: this.lastID });
        }
    );

    stmt.finalize();
});

// Route to serve the configuration form
app.get('/config', (req, res) => {
    res.sendFile(__dirname + '/public/configuration.html');
});

app.get('/data', (req, res) => {
    res.sendFile(__dirname + '/public/data.html');
});

// Route to get the current configuration
app.get('/get-config', (req, res) => {
    fs.readFile('./public/JSON/config.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read configuration file' });
        }
        res.json(JSON.parse(data));
    });
});

// Route to update the configuration
app.post('/update-config', (req, res) => {
    const updatedConfig = req.body;
    fs.writeFile('./public/JSON/config.json', JSON.stringify(updatedConfig, null, 2), 'utf8', (err) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to update configuration file' });
        }
        res.json({ success: true });
    });
});

// Route to retrieve all data
app.get('/get-all-data', (req, res) => {
    db.all('SELECT * FROM fabric_data', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Endpoint to generate Excel file for records of the current month
app.get('/generateExcel', (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startDateString = startOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD format
    const endDateString = endOfMonth.toISOString().split('T')[0]; // YYYY-MM-DD format

    const sql = `SELECT * FROM fabric_data WHERE createdAt BETWEEN ? AND ?`;
    db.all(sql, [startDateString, endDateString], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Create a workbook and worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(rows);

        // Add the worksheet to the workbook
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Orders');

        // Generate buffer of Excel file
        const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Save buffer to a file
        const filePath = path.join(__dirname, 'public', 'orders_this_month.xlsx');
        fs.writeFile(filePath, excelBuffer, (err) => {
            if (err) {
                res.status(500).json({ error: 'Error generating Excel file' });
                return;
            }
            res.download(filePath, 'orders_this_month.xlsx');
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});