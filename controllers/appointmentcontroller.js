const pool = require("../db");

// ✅ Get all appointments
const getAppointments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        a.appointment_id,
        a.appointment_date,
        a.doctor_name,
        a.status,
        a.address,
        json_build_object(
          'patient_id', p.patient_id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'phone', p.phone,
          'dob', p.dob,
          'gender', p.gender
        ) AS patient
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      ORDER BY a.appointment_date ASC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};

// ✅ Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT 
        a.appointment_id,
        a.appointment_date,
        a.doctor_name,
        a.status,
        a.address,
        json_build_object(
          'patient_id', p.patient_id,
          'first_name', p.first_name,
          'last_name', p.last_name
        ) AS patient
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      WHERE a.appointment_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ SQL error:", err);
    res.status(500).json({ error: "Database error" });
  }
};

// ✅ Get tests for a specific patient in an appointment
const getPatientTests = async (req, res) => {
  try {
    const { appointment_id, patient_id } = req.params;

    if (!appointment_id || !patient_id) {
      return res.status(400).json({ message: 'Missing appointment_id or patient_id' });
    }

    // 1️⃣ Get appointment_patient_id
    const apResult = await pool.query(
      `SELECT id FROM appointment_patients WHERE appointment_id = $1 AND patient_id = $2`,
      [appointment_id, patient_id]
    );

    if (apResult.rows.length === 0) {
      return res.status(404).json({ message: 'Patient not linked to appointment' });
    }

    const appointment_patient_id = apResult.rows[0].id;

    // 2️⃣ Fetch patient tests
    const testQuery = await pool.query(
      `SELECT pt.patient_test_id, t.test_id, t.test_name, t.sample_type, t.specimen_type, t.sample_color
       FROM patient_tests pt
       JOIN tests t ON pt.test_id = t.test_id
       WHERE pt.appointment_patient_id = $1`,
      [appointment_patient_id]
    );

    if (testQuery.rows.length === 0) {
      return res.status(404).json({ message: 'No tests found for this patient' });
    }

    res.status(200).json(testQuery.rows);
  } catch (error) {
    console.error('Error fetching patient tests:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export default { getAppointments, getAppointmentById, getPatientTests };
