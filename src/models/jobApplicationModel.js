const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobApplication", jobApplicationSchema);

