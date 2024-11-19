const express = require('express')
const {
  createJob,
  getAllJobs,
  getJobsByCategory,
  deleteJob
} = require('../controllers/jobController')
const { celebrate, Joi, Segments, errors } = require('celebrate')
const {protect} = require("../controllers/employeeController")
const router = express.Router()

router.post('/jobs',   celebrate({
  [Segments.BODY]: Joi.object().keys({
    jobTitle: Joi.string().required(),
    jobDescription: Joi.string().required(),
    jobCategory: Joi.string().required(),
    jobType: Joi.string().required() // Accepts any string value
  })
}),protect, createJob)

router.get('/jobs/getalljobs', getAllJobs)

router.get(
  '/jobs/category/:category',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      category: Joi.string().required()
    })
  }),
  getJobsByCategory
)

router.delete(
  '/jobs/:id',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().hex().length(24).required() // Assuming MongoDB ObjectId (24-character hex string)
    })
  }),
  deleteJob
)

router.use(errors())

module.exports = router
