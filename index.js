// index.js
import express from "express";
import morgan from "morgan";

// Import controllers using ES module syntax
import appointmentController from './controllers/appointmentcontroller.js';
import sampleController from './controllers/samplecontroller.js';
import barcodeController from './controllers/barcodecontroller.js';
import pdfController from './controllers/pdfcontroller.js';
import otpController from './controllers/otpcontroller.js';

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("tiny"));

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// ------------------------
// Appointment Routes
// ------------------------
app.get('/appointments', appointmentController.getAppointments);
app.get('/appointments/:id', appointmentController.getAppointmentById);

app.get(
  '/appointments/:appointment_id/patients/:patient_id/patient-tests',
  appointmentController.getPatientTests
);

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
