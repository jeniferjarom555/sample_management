import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import pool from '../db.js';          // Always include .js in ES module imports
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// To use __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


async function generatePDF(req, res) {
    try {
        // Fetch 10 pending barcodes from DB
        const result = await pool.query(
            `SELECT barcode_id FROM barcode_table WHERE status = 'pending' LIMIT 10`
        );
        const barcodes = result.rows.map(row => row.barcode_id);

        const filePath = path.join(__dirname, '../barcode-stickers.pdf');
        const doc = new PDFDocument({
            size: 'A4', // A4 page size
            margin: 50
        });
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Layout settings
        const stickersPerRow = 2;
        const stickerWidth = 200;
        const stickerHeight = 80;
        const startX = 50;
        const startY = 50;
        const gapX = 50; // space between stickers horizontally
        const gapY = 20; // space between stickers vertically

        for (let i = 0; i < barcodes.length; i++) {
            const code = barcodes[i];

            // Generate barcode image
            const png = await bwipjs.toBuffer({
                bcid: 'code128',
                text: code,
                scale: 3,
                height: 10,
                includetext: true,
                textxalign: 'center',
            });

            // Calculate position in grid
            const row = Math.floor(i / stickersPerRow);
            const col = i % stickersPerRow;
            const x = startX + col * (stickerWidth + gapX);
            const y = startY + row * (stickerHeight + gapY);

            // Place barcode
            doc.image(png, x, y, { width: stickerWidth - 20 });
        }

        doc.end();

        writeStream.on('finish', () => {
            res.sendFile(filePath); // Send PDF to browser
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error generating PDF');
    }
}

export default  { generatePDF };