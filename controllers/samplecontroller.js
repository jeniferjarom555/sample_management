const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

// POST /appointments/:appointment_id/patients/:patient_id/add-test
// POST /appointments/:appointment_id/patients/:patient_id/add-test
async function addTestToPatient(req, res) {
  try {
    const { appointment_id, patient_id } = req.params;
    const { test_id } = req.body;

    if (!appointment_id || !patient_id || !test_id) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // 1️⃣ Get appointment_patient_id
    const apResult = await pool.query(
      `SELECT id FROM appointment_patients WHERE appointment_id = $1 AND patient_id = $2`,
      [appointment_id, patient_id]
    );
    if (apResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not linked to appointment" });
    }
    const appointment_patient_id = apResult.rows[0].id;

    // 2️⃣ Check if test already exists for patient
    const check = await pool.query(
      `SELECT * FROM patient_tests WHERE appointment_patient_id = $1 AND test_id = $2`,
      [appointment_patient_id, test_id]
    );
    if (check.rows.length > 0) {
      return res.status(409).json({ message: "Test already added for this patient" });
    }

    // 3️⃣ Insert into patient_tests
    const patient_test_id = uuidv4();
    await pool.query(
      `INSERT INTO patient_tests
       (patient_test_id, appointment_patient_id, test_id, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [patient_test_id, appointment_patient_id, test_id]
    );

    // 4️⃣ Get test info
    const testInfo = await pool.query(
      `SELECT test_id, test_name, sample_type, specimen_type, sample_color
       FROM tests WHERE test_id = $1`,
      [test_id]
    );
    const testData = testInfo.rows[0];

    // 5️⃣ Update or create sample
    const sampleCheck = await pool.query(
      `SELECT * FROM samples
       WHERE appointment_id = $1 AND patient_id = $2
       AND sample_type = $3 AND specimen_type = $4 AND sample_color = $5`,
      [appointment_id, patient_id, testData.sample_type, testData.specimen_type, testData.sample_color]
    );

    let sample_id;
    if (sampleCheck.rows.length > 0) {
      // Sample exists → reuse
      sample_id = sampleCheck.rows[0].sample_id;

      // Update tests array only if test_id not already inside
await pool.query(
  `UPDATE samples
   SET tests = CASE
     WHEN NOT (tests @> $1::jsonb) THEN tests || $1::jsonb
     ELSE tests
   END
   WHERE sample_id = $2`,
  [JSON.stringify([patient_test_id]), sample_id]   // ✅ use patient_test_id
);


    } else {
      // Sample doesn’t exist → create new
      sample_id = uuidv4();
await pool.query(
  `INSERT INTO samples
   (sample_id, appointment_id, patient_id, tests, sample_type, specimen_type, sample_color, created_at)
   VALUES ($1, $2, $3, COALESCE($4::jsonb, '[]'::jsonb), $5, $6, $7, NOW())`,
  [sample_id, appointment_id, patient_id, JSON.stringify([patient_test_id]),
   testData.sample_type, testData.specimen_type, testData.sample_color]
);

    }

    // 6️⃣ Link patient_test to sample
    await pool.query(
      `UPDATE patient_tests SET sample_id = $1 WHERE patient_test_id = $2`,
      [sample_id, patient_test_id]
    );

    res.status(201).json({ message: "Test added to patient", test: testData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}



// POST /generate-samples
async function generateSamples(req, res) {
  try {
    const { appointment_id, patient_id, test_names } = req.body; // frontend sends names

    if (!appointment_id || !patient_id || !Array.isArray(test_names) || test_names.length === 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // 1️⃣ Get appointment_patient_id
    const apResult = await pool.query(
      `SELECT id FROM appointment_patients WHERE appointment_id = $1 AND patient_id = $2`,
      [appointment_id, patient_id]
    );

    if (apResult.rows.length === 0) {
      return res.status(404).json({ message: "Patient not linked to appointment" });
    }
    const appointment_patient_id = apResult.rows[0].id;

    // 2️⃣ Fetch test info from test names
    const testQuery = await pool.query(
      `SELECT test_id, test_name, sample_type, specimen_type, sample_color
       FROM tests
       WHERE test_name = ANY($1::text[])`,
      [test_names]
    );

    if (testQuery.rows.length === 0) {
      return res.status(404).json({ message: "No valid tests found" });
    }

    const insertedTests = [];
    for (const test of testQuery.rows) {
      const patient_test_id = uuidv4();
      await pool.query(
        `INSERT INTO patient_tests
         (patient_test_id, appointment_patient_id, test_id, created_at)
         VALUES ($1, $2, $3, NOW())`,
        [patient_test_id, appointment_patient_id, test.test_id]
      );

      insertedTests.push({
        patient_test_id,
        sample_type: test.sample_type,
        specimen_type: test.specimen_type,
        sample_color: test.sample_color
      });
    }

    // 3️⃣ Group tests by sample_type/specimen_type/color
    const grouped = {};
    for (const t of insertedTests) {
      const key = `${t.sample_type}-${t.specimen_type}-${t.sample_color}`;
      if (!grouped[key]) {
        grouped[key] = {
          sample_id: uuidv4(),
          sample_type: t.sample_type,
          specimen_type: t.specimen_type,
          sample_color: t.sample_color,
          tests: []
        };
      }
      grouped[key].tests.push(t.patient_test_id); // store patient_test_ids
    }

    // 4️⃣ Insert samples into DB
    for (const group of Object.values(grouped)) {
      await pool.query(
        `INSERT INTO samples 
         (sample_id, appointment_id, patient_id, tests, sample_type, specimen_type, sample_color, sample_collected)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          group.sample_id,
          appointment_id,
          patient_id,
          JSON.stringify(group.tests),
          group.sample_type,
          group.specimen_type,
          group.sample_color,
          false
        ]
      );
    }

    res.status(201).json({ message: "Tests added to patient", grouped_tests: Object.values(grouped) });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
}

async function getTests(req, res) {
  try {
    const result = await pool.query(
      `SELECT test_id, test_name, sample_type, specimen_type, sample_color
       FROM tests ORDER BY test_name ASC`
    );
    res.status(200).json({ message: "Available tests", tests: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

module.exports = { generateSamples, getTests, addTestToPatient };
