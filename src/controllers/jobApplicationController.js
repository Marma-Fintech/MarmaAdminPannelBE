const JobApplication = require('../models/jobApplicationModel')
const nodemailer = require('nodemailer')
require('dotenv').config()

const applyForJob = async (req, res, next) => {
  try {
    const {
      name,
      email,
      applyingDesignation,
      experience,
      noticeperiod,
      currentsalary,
      expectedsalary,
      Portfoliolink
    } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'Resume is required' })
    }

    // Check if the user has already applied for the same role with the same email
    const existingApplication = await JobApplication.findOne({
      email: email,
      applyingDesignation: applyingDesignation
    })

    if (existingApplication) {
      return res.status(400).json({
        message: `You have already applied for the ${applyingDesignation} role with this email.`
      })
    }

    // Create a new job application if no existing application is found
    const jobApplication = new JobApplication({
      ...req.body,
      resume: req.file.path // Save the resume file path
    })

    await jobApplication.save()

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use your email provider
      auth: {
        user: process.env.ADMIN_EMAIL, // Admin email from environment
        pass: process.env.ADMIN_EMAIL_PASS // Admin email password from environment
      }
    })

    // Email to the user
    const userMailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: 'Thank You for Applying',
      text: `Hi ${name},\n\nThank you for applying for the position of ${applyingDesignation}. We’ve received your application and will be in touch if your profile aligns with our requirements.\n\nBest Regards,\nMARMA FINTECH Team`
    }

    // Email to the admin with user's details
    const adminMailOptions = {
      from: `"${name} <${email}>" <${process.env.ADMIN_EMAIL}>`, // Display user's name and email with the admin's email as the sender
      to: process.env.ADMIN_EMAIL, // Admin email as the recipient
      replyTo: email, // Ensures replies go directly to the user's email
      subject: `New Job Application - ${applyingDesignation}`,
      text: `A new application has been received:\n\nName: ${name}\nEmail: ${email}\nApplying for: ${applyingDesignation}\nExperience: ${experience}\nNotice Period: ${noticeperiod}\nCurrent Salary: ${currentsalary}\nExpected Salary: ${expectedsalary}\nPortfolio Link: ${
        Portfoliolink || ''
      }\nResume Link: ${
        jobApplication.resume
      }\n\nPlease review the application.`
    }

    // Send emails to both the user and admin
    await transporter.sendMail(userMailOptions)
    await transporter.sendMail(adminMailOptions)

    res.status(201).json({
      message: 'Application submitted successfully.',
      jobApplication
    })
  } catch (err) {
    next(err)
  }
}

const getAllJobApplications = async (req, res, next) => {
  try {
    const { page = 1, sort = 'asc', applyingDesignation } = req.query;

    // Set default limit
    const limit = 50;

    // Parse the page number
    const pageNumber = parseInt(page, 10) || 1;

    // Build the query object for filtering
    const query = {};
    if (applyingDesignation) {
      query.applyingDesignation = new RegExp(`^${applyingDesignation.trim()}`, 'i'); // Case-insensitive match, trims spaces
    }

    // Determine sorting order
    const sortOrder = sort.toLowerCase() === 'desc' ? -1 : 1;

    // Fetch filtered, sorted, and paginated data
    const applications = await JobApplication.find(query)
      .sort({ createdAt: sortOrder }) // Adjust 'createdAt' field for sorting
      .skip((pageNumber - 1) * limit)
      .limit(limit);

    // Get the total count of applications for pagination metadata
    const totalApplications = await JobApplication.countDocuments(query);

    res.status(200).json({
      totalApplications,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalApplications / limit),
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  applyForJob,
  getAllJobApplications,
}
