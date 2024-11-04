// models/JobModel.js
const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  jobDescription: { type: String, required: true },
  jobCategory: { type: String, required: true },
  jobType: { type: String, required: true }, // e.g., Full-time, Part-time, Contract
});

module.exports = mongoose.model("Job", jobSchema);
