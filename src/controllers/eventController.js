const Event = require('../models/eventModel')
const axios = require('axios')
const cheerio = require('cheerio')
const cloudinary = require('cloudinary').v2 // Import Cloudinary directly
require('dotenv').config()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
})

const getAllEvents = async (req, res, next) => {
  try {
    const { timeFrame, page = 1 } = req.query

    // Set default limit
    const limit = 50
    let filter = {}
    if (timeFrame === 'Last week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filter = { createdAt: { $gte: oneWeekAgo } }
    }
    const skip = (page - 1) * limit
    const events = await Event.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
    // Get the total count of events for the given filter
    const totalEvents = await Event.countDocuments(filter)
    res.status(200).json({
      totalEvents,
      currentPage: Number(page),
      totalPages: Math.ceil(totalEvents / limit),
      events
    })
  } catch (err) {
    next(err)
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
    return res.status(400).json({ error: 'Link is required' });
  }

  try {
    const existingEvent = await Event.findOne({ link });

    if (existingEvent) {
      return res.status(400).json({ error: 'Event with this link already exists' });
    }

    const response = await axios.get(link);
    const html = response.data;

    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'No title';
    let description = $('meta[property="og:description"]').attr('content') ||
                      $('meta[name="description"]').attr('content') ||
                      'No description';

    if (description.length < 100) {
      description = $('body').text().slice(0, 1000).trim();
    }

    const image = $('meta[property="og:image"]').attr('content') || null;
    console.log('Extracted image URL:', image);

    let cloudinaryImageUrl = null;

    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'marmaAdminPanel',
          resource_type: 'image'
        });
        cloudinaryImageUrl = uploadResponse.secure_url;
        console.log('Uploaded image URL:', cloudinaryImageUrl);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    } else {
      console.warn('No image found for the given link.');
    }

    const newEvent = new Event({
      title,
      description,
      image: cloudinaryImageUrl || '', // Default as fallback
      link: link
    });

    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (err) {
    next(err);
  }
};



module.exports = {
  deleteEvent,
  getAllEvents,
  eventLink
}
