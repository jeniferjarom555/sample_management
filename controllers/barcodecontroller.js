import { nanoid } from "nanoid";  // ✅ Correct
import pool from "../db.js";       // ✅ Already correct


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
    let { sample_id, barcode_id } = req.body;

    if (!sample_id || !barcode_id) {
      return res.status(400).json({ success: false, error: "sample_id and barcode_id are required" });
    }

    barcode_id = barcode_id.trim();

    // 1. Check if sample exists
    const sampleCheck = await pool.query(
      "SELECT * FROM samples WHERE sample_id = $1",
      [sample_id]
    );
    if (sampleCheck.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Sample not found" });
    }

    const sampleRow = sampleCheck.rows[0];

    // 2. Check if sample already has a barcode
    if (sampleRow.barcode_id) {
      return res.json({
        success: false,
        message: `Sample ${sample_id} already has a barcode assigned: ${sampleRow.barcode_id}`,
      });
    }

    // 3. Check if barcode exists and is pending
    const barcodeCheck = await pool.query(
      "SELECT * FROM barcode_table WHERE LOWER(barcode_id) = LOWER($1)",
      [barcode_id]
    );
    if (barcodeCheck.rowCount === 0) {
      return res.status(404).json({ success: false, error: "Barcode not found" });
    }

    const barcodeRow = barcodeCheck.rows[0];
    if (barcodeRow.status === "assigned") {
      return res.json({
        success: false,
        message: `Barcode ${barcode_id} is already assigned to a sample`,
      });
    }

    // 4. Assign barcode to sample
    await pool.query(
      "UPDATE samples SET barcode_id = $1 WHERE sample_id = $2",
      [barcode_id, sample_id]
    );

    // 5. Update barcode_table → mark as assigned
    await pool.query(
      "UPDATE barcode_table SET status = 'assigned', sample_id = $1 WHERE barcode_id = $2",
      [sample_id, barcode_id]
    );

    return res.json({
      success: true,
      message: `✅ Barcode ${barcode_id} assigned to sample ${sample_id}`,
    });
  } catch (err) {
    console.error("Error in matchSample:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
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




export default {
  insertBarcodes,
  matchSample,
  getSampleByBarcode,
};

