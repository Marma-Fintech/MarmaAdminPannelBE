const Event = require('../models/eventModel');
const axios = require('axios');
const cheerio = require('cheerio');
const cloudinary = require('cloudinary').v2;  // Import Cloudinary directly
require("dotenv").config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find() // Retrieves all events from the database
    res.status(200).json(events)
  } catch (err) {
    next(err) // Pass the error to the error handling middleware
  }
}

// Function to delete a specific event by ID
const deleteEvent = async (req, res, next) => {
  try {
    const eventId = req.params.id
    const deletedEvent = await Event.findByIdAndDelete(eventId)

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' })
    }

    res
      .status(200)
      .json({ message: 'Event deleted successfully', event: deletedEvent })
  } catch (err) {
    next(err)
  }
}

const eventLink = async (req, res, next) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ error: 'link is required' });
  }

  try {
    // Check if the link already exists in the Event collection
    const existingEvent = await Event.findOne({ link });

    if (existingEvent) {
      return res.status(400).json({ error: 'Event with this link already exists' });
    }

    // Fetch the HTML content of the link
    const response = await axios.get(link);
    const html = response.data;

    // Load the HTML into cheerio
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'No title';
    let description = $('meta[property="og:description"]').attr('content') ||
                      $('meta[name="description"]').attr('content') ||
                      $('meta[property="twitter:description"]').attr('content') ||
                      'No description';
                      
    // If description is still too short or missing, extract more text from the body
    if (description.length < 100) { // You can adjust the length threshold
      description = $('body').text().slice(0, 1000).trim(); // Extract more text, up to 1000 characters
    }

    const image = $('meta[property="og:image"]').attr('content') || null;

    let cloudinaryImageUrl = null;

    // Upload image to Cloudinary if an image URL exists
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "marmaAdminPanel",
        resource_type: "image",
      });
      cloudinaryImageUrl = uploadResponse.secure_url;
    }

    // Save data to MongoDB
    const newEvent = new Event({
      title,
      description,
      image: cloudinaryImageUrl || '',
      link: link
    });
    await newEvent.save();

    // Send response with saved data
    res.status(201).json(newEvent);
  } catch (err) {
    next(err)
  }
};

module.exports = {
  deleteEvent,
  getAllEvents,
  eventLink
}
