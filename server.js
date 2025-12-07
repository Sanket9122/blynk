const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;
require('dotenv').config();

// MongoDB connect (no extra options needed now)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Schema
const dataSchema = new mongoose.Schema({
  device: String,
  datastream: String,
  value: String,
  time: String
});
const BlynkData = mongoose.model('BlynkData', dataSchema);

// Middleware
app.use(express.json());

// Webhook route
app.post('/blynk-data', async (req, res) => {
  try {
    console.log("Data received:", req.body);
    const newData = new BlynkData(req.body);
    await newData.save();
    res.status(200).send("Data saved successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});

// Test route
app.get('/', (req, res) => {
  res.send("Server is live and ready for Blynk webhooks!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
