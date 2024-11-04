// controllers/jobController.js
const Job = require("../models/jobModel"); // Ensure the import is correct

exports.createJob = async (req, res) => {
  try {
    const { jobTitle, jobDescription, jobCategory, jobType } = req.body;

    // Validate required fields
    if (!jobTitle || !jobDescription || !jobCategory || !jobType) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const job = new Job({ jobTitle, jobDescription, jobCategory, jobType });
    console.log("Job to save:", job); // Log the job before saving

    await job.save(); // Attempt to save the job
    res.status(201).json({ message: "Job posted successfully", job });
  } catch (error) {
    console.error("Error posting job:", error); // Log any errors
    res.status(500).json({ message: "Error posting job", error });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Error fetching jobs", error });
  }
};


// New function to get jobs by partial match of category
exports.getJobsByCategory = async (req, res) => {
    const { category } = req.params;
  
    try {
      const jobs = await Job.find({
        jobCategory: { $regex: category, $options: "i" } // Case-insensitive search
      });
      console.log("Fetched jobs:", jobs); // Log the fetched jobs
  
      if (jobs.length === 0) {
        return res.status(404).json({ message: "No jobs found for this category." });
      }
      res.status(200).json({ jobs });
    } catch (error) {
      console.error("Error fetching jobs by category:", error);
      res.status(500).json({ message: "Error fetching jobs", error });
    }
  };
  

  exports.deleteJob = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedJob = await Job.findByIdAndDelete(id);
      if (!deletedJob) {
        return res.status(404).json({ message: "Job not found." });
      }
      res.status(200).json({ message: "Job deleted successfully.", deletedJob });
    } catch (error) {
      console.error("Error deleting job:", error);
      res.status(500).json({ message: "Error deleting job", error });
    }
  };