const Event = require('../models/eventModel')

const postEvent = async (req, res, next) => {
  try {
    const updateFields = req.body
    let image

    // Check if req.file is present (uploaded image)
    if (req.file) {
      image = req.file.path // Use the path from multer to store in the database
      updateFields.image = image // Add the image path to the updateFields
    } 
    else if (!req.params.id) {
      // If creating a new event and no image is provided, return an error
      return res.status(400).json({ message: 'Image is required' })
    }

    // Convert date to UTC midnight to avoid timezone issues
    if (updateFields.date) {
      const date = new Date(updateFields.date)
      date.setUTCHours(18, 30, 0, 0) // Set time to 00:00 UTC
      updateFields.date = date
    }

    const eventId = req.params.id

    // Check if an event with the given ID exists
    let updatedEvent = await Event.findById(eventId)

    if (updatedEvent) {
      // If the event exists, update it
      updatedEvent = await Event.findByIdAndUpdate(eventId, updateFields, {
        new: true, // Return the updated document
        runValidators: true // Ensure that the update respects schema validations
      })
    } else {
      // If the event doesn't exist, create a new one with the provided data
      updatedEvent = await Event.create(updateFields)
    }

    // Respond with the created or updated event
    res
      .status(200)
      .json({ message: 'Event created successfully', event: updatedEvent })
  } catch (err) {
    next(err) // Pass the error to the error handling middleware
  }
}

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

const getUpcomingEvents = async (req, res, next) => {
  try {
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() }
    }).sort({ date: 1 })
    res.status(200).json(upcomingEvents)
  } catch (err) {
    next(err)
  }
}

const getPassedEvents = async (req, res, next) => {
  try {
    const passedEvents = await Event.find({ date: { $lt: new Date() } }).sort({
      date: -1
    })
    res.status(200).json(passedEvents)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  postEvent,
  deleteEvent,
  getAllEvents,
  getUpcomingEvents,
  getPassedEvents
}
