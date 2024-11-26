const Event = require('../models/eventModel')
const puppeteer = require('puppeteer');
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

// Function to fetch metadata using Puppeteer
const fetchMetadataWithPuppeteer = async (link) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for AWS EC2
    headless: true,
  });
  const page = await browser.newPage();

  try {
    await page.goto(link, { waitUntil: 'domcontentloaded' });

    const metadata = await page.evaluate(() => {
      const getMeta = (name) => document.querySelector(`meta[property="${name}"]`)?.content || null;

      const title = getMeta('og:title') || document.title || 'No title';
      const ogDescription = getMeta('og:description') || null;
      const metaDescription = document.querySelector('meta[name="description"]')?.content || null;
      const bodyText = document.body.innerText || '';

      // Combine descriptions
      let description = ogDescription || metaDescription || '';
      if (description.length < 100) {
        // If the meta description is too short, add body text
        description = `${description}\n${bodyText.slice(0, 1000)}`.trim();
      }

      // Ensure the description is within a sensible length
      if (description.length > 1000) {
        description = description.slice(0, 1000) + '...'; // Truncate if too long
      }

      const image = getMeta('og:image') || null;

      return { title, description, image };
    });

    return metadata;
  } finally {
    await browser.close();
  }
};


const eventLink = async (req, res, next) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ error: 'Link is required' });
  }

  try {
    // Check if the event already exists
    const existingEvent = await Event.findOne({ link });
    if (existingEvent) {
      return res.status(400).json({ error: 'Event with this link already exists' });
    }

    // Fetch metadata using Puppeteer
    const { title, description, image } = await fetchMetadataWithPuppeteer(link);

    let cloudinaryImageUrl = null;

    // Upload image to Cloudinary if an image URL exists
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'marmaAdminPanel',
          resource_type: 'image',
        });
        cloudinaryImageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
      }
    }

    // Save new event to MongoDB
    const newEvent = new Event({
      title,
      description,
      image: cloudinaryImageUrl || '',
      link: link,
    });
    await newEvent.save();

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error in eventLink:', err);
    next(err);
  }
};




module.exports = {
  deleteEvent,
  getAllEvents,
  eventLink
}
