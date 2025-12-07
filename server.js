const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();

// MongoDB connect (no extra options needed now)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema
// const dataSchema = new mongoose.Schema({
//   device: String,
//   datastream: String,
//   value: String,
//   time: String
// });
const dataSchema = new mongoose.Schema({}, { strict: false });

const BlynkData = mongoose.model('BlynkData', dataSchema);

// Middleware
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());


// Webhook route
app.post('/blynk-data', async (req, res) => {
  try {
    console.log("Raw data received:", req.body);

    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        console.log("Payload is not JSON, using raw/form data");
      }
    }

    const newData = new BlynkData(payload);
    await newData.save();

    res.sendStatus(200);
  } catch (err) {
    console.error("Error saving data:", err);
    res.sendStatus(500);
  }
});

// app.post('/blynk-data', async (req, res) => {
//   try {
//     console.log("Data received:", req.body);
//     const newData = new BlynkData(req.body);
//     await newData.save();
//     res.status(200).json({status :"ok"});
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({status : "error"});
//   }
// });

// Test route
app.get('/', (req, res) => {
  res.send("Server is live and ready for Blynk webhooks!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
