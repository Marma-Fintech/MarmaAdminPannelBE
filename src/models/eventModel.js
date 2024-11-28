const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid') // Import UUID package

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    image: { 
      type: String, 
      required: false, 
      default: '' 
    },
    link: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    eventDate: {
      type: Date,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
      unique: true, // Ensures UUID is unique
      default: () => uuidv4().slice(0, 4) // Generate UUID and slice it to 4 characters
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Event', eventSchema)
