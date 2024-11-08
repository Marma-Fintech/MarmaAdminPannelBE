const express = require('express');
const router = express.Router();
const { upload } = require('../utils/multer');
const { applyForJob, getAllJobApplications, getJobApplicationsByRole } = require('../controllers/jobApplicationController');
const { celebrate, Joi, Segments,errors } = require('celebrate');

router.post(
  '/apply',
  upload.single('resume'),
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      applyingDesignation: Joi.string().required(),
      email: Joi.string().email().required(),
      experience: Joi.string().required(),
      noticeperiod: Joi.string().required(),
      currentsalary: Joi.number().required(),
      expectedsalary: Joi.number().required(),
      Portfoliolink: Joi.string().uri().optional(),
    }),
  }),
  applyForJob
);


router.get('/applications', getAllJobApplications);


router.get(
  '/applications/:role',
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      role: Joi.string().required(),
    }),
  }),
  getJobApplicationsByRole
);

router.use(errors());

module.exports = router;
