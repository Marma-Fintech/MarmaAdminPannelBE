const Feedback = require('../models/feedbackModel');

// POST: Create a new feedback
const createFeedback = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Create a new feedback instance
    const newFeedback = new Feedback({
      name,
      email,
      message,
    });

    // Save the feedback to the database
    await newFeedback.save();

    // Send a success response
    return res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error });
  }
};

const getAllfeedback = async (req, res, next) => {
    try {
      const feedbacks = await Feedback.find() // Retrieves all events from the database
      res.status(200).json(feedbacks)
    } catch (err) {
      next(err) 
    }
  }

module.exports = { createFeedback, getAllfeedback };