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
    const currentDate = new Date(); // Make sure this line is added
    let filter = {}
    if (timeFrame === 'Last week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      filter = { eventDate: { $gte: oneWeekAgo, $lt: currentDate } }
    }else if (timeFrame === 'One month') {
      // Events from the last 30 days
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(currentDate.getDate() - 30);
      filter = { eventDate: { $gte: oneMonthAgo, $lt: currentDate } };
    }
    const skip = (page - 1) * limit
    const events = await Event.find(filter)
      .sort({ eventDate: -1 })
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
  const { link, eventDate } = req.body
  if (!link) {
    return res.status(400).json({ error: 'Link is required' })
  }

  if (!eventDate) {
    return res.status(400).json({ error: 'Event date is required' })
  }
  const parsedDate = new Date(eventDate)
  if (isNaN(parsedDate.getTime())) {
    return res
      .status(400)
      .json({ error: 'Invalid event date format. Use YYYY-MM-DD.' })
  }
  try {
    const existingEvent = await Event.findOne({ link })
    if (existingEvent) {
      return res
        .status(400)
        .json({ error: 'Event with this link already exists.' })
    }
    const response = await axios.get(link)
    const html = response.data
    const $ = cheerio.load(html)
    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      'No title'
    //Extract description from meta tags, if available
    let description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      'No description'
    const image = $('meta[property="og:image"]').attr('content') || null
    let cloudinaryImageUrl = null
    if (image) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: 'marmaAdminPanel',
          resource_type: 'image'
        })
        cloudinaryImageUrl = uploadResponse.secure_url
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError)
      }
    }
    const newEvent = new Event({
      title,
      description,
      image: cloudinaryImageUrl || '',
      link,
      eventDate: parsedDate
    })
    await newEvent.save()
    // Format the eventDate to 'YYYY-MM-DD' before sending the response
    const formattedEvent = {
      ...newEvent._doc, // Spread the event document to a plain object
      eventDate: newEvent.eventDate.toISOString().split('T')[0] // Format eventDate to 'YYYY-MM-DD'
    }
    res.status(201).json(formattedEvent)
  } catch (err) {
    next(err)
  }
}

const getPaginatedUpcomingEvents = async (req, res, next) => {
  try {
    const { page = 1 } = req.query
    // Convert the page query parameter to a number
    const pageNumber = Number(page)
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ error: 'Invalid page number' })
    }
    const limit = 2 // Number of events per page
    const skip = (pageNumber - 1) * limit
    // Get today's date and set the time to 00:00:00 for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    // Fetch events with eventDate >= today
    const upcomingEvents = await Event.find({ eventDate: { $gte: today } })
      .sort({ eventDate: 1 }) // Sort by eventDate in ascending order
      .skip(skip)
      .limit(limit)
    // Get total count of upcoming events
    const totalEvents = await Event.countDocuments({
      eventDate: { $gte: today }
    })
    res.status(200).json({
      totalEvents,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalEvents / limit),
      events: upcomingEvents
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  deleteEvent,
  getAllEvents,
  eventLink,
  getPaginatedUpcomingEvents
}
