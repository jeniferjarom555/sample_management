const { nanoid } = require('nanoid');
const pool = require('../db');

// Function to insert barcodes
async function insertBarcodes(count = 10) {
  try {
    for (let i = 0; i < count; i++) {
      const barcode_id = nanoid(8);
      const status = 'pending';

      await pool.query(
        `INSERT INTO barcode_table (barcode_id, status) VALUES ($1, $2)`,
        [barcode_id, status]
      );

      console.log(`Inserted barcode ${i + 1}: ${barcode_id}`);
    }

    return { message: `${count} barcode IDs inserted successfully.` };
  } catch (error) {
    console.error('Error inserting barcodes:', error);
    throw error;
  }
}


// barcodeController.js
async function matchSample(req, res) {
  try {
    const { sample_id, barcode_id } = req.body;

    // safety check: both IDs must exist
    const sampleCheck = await pool.query(
      "SELECT * FROM samples WHERE sample_id = $1",
      [sample_id]
    );
    if (sampleCheck.rowCount === 0) {
      return res.status(404).json({ error: "Sample not found" });
    }
// check barcode exists & pending
    const barcodeCheck = await pool.query(
      "SELECT * FROM barcode_table WHERE barcode_id = $1 AND status = 'pending'",
      [barcode_id]
    );
    if (barcodeCheck.rowCount === 0) {
      return res.status(404).json({ error: "Barcode not found or already assigned" });
    }

    // Step 1: link barcode_id in samples table
    await pool.query(
      "UPDATE samples SET barcode_id = $1 WHERE sample_id = $2",
      [barcode_id, sample_id]
    );

    // Step 2: update barcode_table → set status + attach sample_id
    await pool.query(
      "UPDATE barcode_table SET status = 'assigned', sample_id = $1 WHERE barcode_id = $2",
      [sample_id, barcode_id]
    );

    res.json({
      message: `Barcode ${barcode_id} assigned to sample ${sample_id}`
    });

  } catch (err) {
    console.error("Error in matchSample:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Get sample details by barcode_id
async function getSampleByBarcode(req, res) {
  try {
    const { barcode_id } = req.body;

    if (!barcode_id) {
      return res.status(400).json({ error: "barcode_id is required" });
    }

    // Fetch the sample record linked to this barcode
    const result = await pool.query(
      `SELECT s.*
       FROM samples s
       JOIN barcode_table b
       ON s.barcode_id = b.barcode_id
       WHERE b.barcode_id = $1 AND b.status = 'assigned'`,
      [barcode_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No sample found for this barcode_id" });
    }

    res.json({
      message: `Sample found for barcode ${barcode_id}`,
      sample: result.rows[0]
    });
  } catch (err) {
    console.error("Error fetching sample by barcode:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  insertBarcodes,
  matchSample,
  getSampleByBarcode
};

