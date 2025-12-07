const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// MongoDB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema (flexible to accept any payload)
const dataSchema = new mongoose.Schema({}, { strict: false });
const BlynkData = mongoose.model('BlynkData', dataSchema);

// Middleware to handle all content types
app.use(express.urlencoded({ extended: true }));   // for form-data / x-www-form-urlencoded
app.use(express.text({ type: '*/*' }));            // for raw text
app.use(express.json());                           // for JSON

// Webhook route
app.post('/blynk-data', async (req, res) => {
  try {
    console.log("Headers:", req.headers);
    console.log("Raw body:", req.body);

    let payload = req.body;

    // If payload is string, try parsing JSON
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        console.log("Payload is not JSON, using raw/form data");
      }
    }

    const newData = new BlynkData(payload);
    await newData.save();

    res.sendStatus(200);   // Always return 200 OK
  } catch (err) {
    console.error("Error saving data:", err);
    res.sendStatus(500);
  }
});

// Test route
app.get('/', (req, res) => {
  res.send("Server is live and ready for Blynk webhooks!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
