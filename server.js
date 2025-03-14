const express = require('express');
const fs = require('fs').promises;
const csv = require('csv-parse');
const { promisify } = require('util');
const path = require('path');
const parseCSV = promisify(csv.parse);

const app = express();
app.use(express.json());

// Set the persistent volume path from environment variable or use default
const PV_PATH = process.env.PV_PATH || '/bishad_PV_dir';

app.post('/calculate', async (req, res) => {
    const { file, product } = req.body;

    try {
        // Try to read the file from the persistent volume
        let fileContent;
        try {
            fileContent = await fs.readFile(path.join(PV_PATH, file), 'utf-8');
        } catch (error) {
            return res.json({
                "file": file,
                "error": "File not found."
            });
        }

        // Parse CSV
        let records;
        try {
            records = await parseCSV(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            });

            // Validate CSV format
            if (!records[0] || !records[0].product || !records[0].amount) {
                throw new Error('Invalid CSV format');
            }
        } catch (error) {
            return res.json({
                "file": file,
                "error": "Input file not in CSV format."
            });
        }

        // Calculate sum
        const sum = records
            .filter(record => record.product === product)
            .reduce((acc, record) => acc + parseInt(record.amount), 0);

        // Return result
        res.json({
            "file": file,
            "sum": sum
        });

    } catch (error) {
        res.json({
            "file": file,
            "error": "Input file not in CSV format."
        });
    }
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
    console.log(`Calculation service running on port ${PORT}`);
});