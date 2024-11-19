const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // Import UUID package
const jobApplicationSchema = new mongoose.Schema(
  {
    resume: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    applyingDesignation: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    noticeperiod: {
      type: String,
      required: true,
    },
    currentsalary: {
      type: Number,
      required: true,
    },
    expectedsalary: {
      type: Number,
      required: true,
    },
    Portfoliolink: {
      type: String,
      default: "",
    },
    uuid: {
      type: String,
      required: true,
      unique: true, // Ensures UUID is unique
      default: () => uuidv4().slice(0, 4) // Generate UUID and slice it to 4 characters
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("JobApplication", jobApplicationSchema);

