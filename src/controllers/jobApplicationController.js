const JobApplication = require('../models/jobApplicationModel');
const nodemailer = require('nodemailer');
require('dotenv').config();


const applyForJob = async (req, res, next) => {
  try {
    const { name, email, applyingDesignation } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Resume is required' });
    }

    // Check if the user has already applied for the same role with the same email
    const existingApplication = await JobApplication.findOne({
      email: email,
      applyingDesignation: applyingDesignation,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: `You have already applied for the ${applyingDesignation} role with this email.`,
      });
    }

    // Create a new job application if no existing application is found
    const jobApplication = new JobApplication({
      ...req.body,
      resume: req.file.path, // Save the resume file path
    });

    await jobApplication.save();

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or use your email provider
      auth: {
        user: process.env.ADMIN_EMAIL, // Admin email from environment
        pass: process.env.ADMIN_EMAIL_PASS, // Admin email password from environment
      },
    });

    // Email to the user
    const userMailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: 'Thank You for Applying',
      text: `Hi ${name},\n\nThank you for applying for the position of ${applyingDesignation}. We’ve received your application and will be in touch if your profile aligns with our requirements.\n\nBest Regards,\nMARMA FINTECH Team`,
    };

    // Email to the admin with user's details
    const adminMailOptions = {
      from: email,
      to: process.env.ADMIN_EMAIL, // Admin email
      subject: `New Job Application - ${applyingDesignation}`,
      text: `A new application has been received:\n\nName: ${name}\nEmail: ${email}\nApplying for: ${applyingDesignation}\nResume Link: ${jobApplication.resume}\n\nPlease review the application.`,
    };

    // Send emails to both the user and admin
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.status(201).json({
      message: 'Application submitted successfully.',
      jobApplication,
    });
  } catch (err) {
    next(err);
  }
};


  const getAllJobApplications = async (req, res, next) => {
    try {
      // Fetch all job applications from the database
      const applications = await JobApplication.find();
      res.status(200).json(applications);
    } catch (error) {
      next(error);
    }
  };

// Controller to get job applications by partial match in applying role
const getJobApplicationsByRole = async (req, res,next) => {
  const applyingDesignation = req.params.role;

  try {
    // Find job applications with a case-insensitive partial match for applyingDesignation
    const applications = await JobApplication.find({
      applyingDesignation: { $regex: applyingDesignation, $options: 'i' } // Partial, case-insensitive match
    });

    if (applications.length === 0) {
      return res.status(404).json({ message: 'No job applications found for this role' });
    }

    res.status(200).json(applications);
  } catch (error) {
    next(error);
    res.status(500).json({ message: 'Error fetching job applications', error: error.message });
  }
};
  
  module.exports = {
    applyForJob,
    getAllJobApplications,
    getJobApplicationsByRole
  };