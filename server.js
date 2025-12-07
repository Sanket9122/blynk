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
    console.log("Raw body:", req.body);

    let payload = req.body;

    // If payload is string, split by comma
    if (typeof payload === 'string') {
      // Remove quotes and split
      const parts = payload.split(',').map(p => p.replace(/"/g, '').trim());

      // Map CSV parts to meaningful keys
      payload = {
        device_id: parts[0],
        device_productName: parts[1],
        device_dateCreated: parts[2],
        device_name: parts[3],
        device_dataStreamId: parts[4],
        device_dataStreamName: parts[5],
        device_dataStream_X: parts[6],
        timestamp_unix: parts[7]
      };
    }

    console.log("Parsed payload:", payload);

    const newData = new BlynkData(payload);
    await newData.save();

    res.sendStatus(200);
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
