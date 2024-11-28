const express = require('express')
const router = express.Router()
const { upload } = require('../utils/multer')
const {
  applyForJob,
  getAllJobApplications
} = require('../controllers/jobApplicationController')
const { protect } = require('../controllers/employeeController')
const { celebrate, Joi, Segments, errors } = require('celebrate')

router.post(
  '/apply',
  upload.single('resume'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      applyingDesignation: Joi.string().required(),
      email: Joi.string().email().required(),
      experience: Joi.string().required(),
      department: Joi.string().required(),
      noticeperiod: Joi.string().required(),  
      currentsalary: Joi.number().required(),
      expectedsalary: Joi.number().required(),
      Portfoliolink: Joi.string().uri().optional()
    })
  }),
  applyForJob
)

router.get('/applications', protect, getAllJobApplications)

router.use(errors())

module.exports = router
