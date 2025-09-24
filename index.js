const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sample Management API is running!');
});


// Controllers
const sampleController = require('./controllers/samplecontroller');
const barcodeController = require('./controllers/barcodecontroller'); // to be created
const pdfController = require('./controllers/pdfcontroller'); // to be created
const appointmentController = require('./controllers/appointmentcontroller');
const { matchSample, getSampleByBarcode } = require('./controllers/barcodecontroller');
const { sendOtp, verifyOtp } = require('./controllers/otpcontroller');
const { getTests, addTestToPatient } = require('./controllers/samplecontroller');
const { getPatientTests } = require('./controllers/appointmentcontroller');

// Appointment Routes
app.get('/appointments', appointmentController.getAppointments);
app.get('/appointments/:id', appointmentController.getAppointmentById);
app.get(
  '/appointments/:appointment_id/patients/:patient_id/tests',
  getPatientTests
);

// Sample Routes
app.post('/generate-samples', sampleController.generateSamples);
app.post('/match-sample', matchSample);
app.post('/generate-barcodes', async (req, res) => {
  const result = await barcodeController.insertBarcodes(10);
  res.json(result);
});
app.get('/barcode-pdf', pdfController.generatePDF);
app.post('/get-sample', getSampleByBarcode);

// Test Routes
app.get('/tests', getTests);
app.post(
  '/appointments/:appointment_id/patients/:patient_id/add-test',
  addTestToPatient
);


// OTP Routes
app.post('/send-otp', sendOtp);
app.post('/verify-otp', verifyOtp);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

