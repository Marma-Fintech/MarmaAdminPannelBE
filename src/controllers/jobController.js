const Job = require('../models/jobModel')

const createJob = async (req, res, next) => {
  try {
    const { jobTitle, jobDescription, jobCategory, jobType } = req.body

    // Validate required fields
    if (!jobTitle || !jobDescription || !jobCategory || !jobType) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    const job = new Job({ jobTitle, jobDescription, jobCategory, jobType })

    await job.save() // Attempt to save the job
    res.status(201).json({ message: 'Job posted successfully', job })
  } catch (error) {
    next(error)
  }
}

const getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({})
    res.status(200).json(jobs)
  } catch (error) {
    next(error)
  }
}

const getJobsByCategory = async (req, res, next) => {
  const { category } = req.params

  try {
    const jobs = await Job.find({
      jobCategory: { $regex: category, $options: 'i' } // Case-insensitive search
    })

    if (jobs.length === 0) {
      return res
        .status(404)
        .json({ message: 'No jobs found for this category.' })
    }
    res.status(200).json({ jobs })
  } catch (error) {
    next(error)
  }
}

const deleteJob = async (req, res, next) => {
  const { id } = req.params

  try {
    const deletedJob = await Job.findByIdAndDelete(id)
    if (!deletedJob) {
      return res.status(404).json({ message: 'Job not found.' })
    }
    res.status(200).json({ message: 'Job deleted successfully.', deletedJob })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createJob,
  getAllJobs,
  getJobsByCategory,
  deleteJob
}
