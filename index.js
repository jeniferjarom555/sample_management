const express = require('express');
const app = express();

// Middleware
app.use(express.json());
// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Controllers
const appointmentController = require('./controllers/appointmentcontroller');
const sampleController = require('./controllers/samplecontroller');
const barcodeController = require('./controllers/barcodecontroller');
const pdfController = require('./controllers/pdfcontroller');
const otpController = require('./controllers/otpcontroller');

// ------------------------
// Appointment Routes
// ------------------------
app.get('/appointments', appointmentController.getAppointments);
app.get('/appointments/:id', appointmentController.getAppointmentById);

// Fetch all tests for a patient (non-grouped)
app.get(
  '/appointments/:appointment_id/patients/:patient_id/patient-tests',
  appointmentController.getPatientTests
);

// Fetch grouped tests for UI
app.get(
  '/appointments/:appointment_id/patients/:patient_id/grouped-tests',
  sampleController.getGroupedTests
);

// ------------------------
// Sample Routes
// ------------------------
app.post('/generate-samples', sampleController.generateSamples);
app.post('/match-sample', barcodeController.matchSample);
app.post('/generate-barcodes', async (req, res) => {
  try {
    const result = await barcodeController.insertBarcodes(10);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Error generating barcodes", error: err.message });
  }
});
app.get('/barcode-pdf', pdfController.generatePDF);
app.post('/get-sample', barcodeController.getSampleByBarcode);

// ------------------------
// Test Routes
// ------------------------
app.get('/tests', sampleController.getTests);
app.post(
  '/appointments/:appointment_id/patients/:patient_id/add-test',
  sampleController.addTestToPatient
);

// ------------------------
// OTP Routes
// ------------------------
app.post('/send-otp', otpController.sendOtp);
app.post('/verify-otp', otpController.verifyOtp);

// ------------------------
// Root Route
// ------------------------
app.get('/', (req, res) => {
  res.send('Sample Management API is running!');
});

// ------------------------
// Start Server
// ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
