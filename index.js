const express = require('express')
const mongoose = require('mongoose')
const router = require('./src/routes/allroutes')
const morgan = require('morgan')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 7001

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json('Server running')
})

// Connect to MongoDB
mongoose
  .connect(process.env.DBURL, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('Successfully Connected to MongoDB')
  })
  .catch(err => {
    console.error('MongoDB Connection Failure', err)
  })

// Morgan for logging
app.use(morgan(':method :url :status'))

app.use(router)

app.listen(port, () => {
  console.log(`Server running on ${port}`)
})
