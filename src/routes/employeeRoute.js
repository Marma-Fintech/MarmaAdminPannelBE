const express = require('express');
const { signup, login, signOut } = require('../controllers/employeeController');
const { upload } = require('../utils/multer');
const { celebrate, Joi, Segments,errors } = require("celebrate");


const router = express.Router();


router.post(
  '/signup',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    }),
  }),
  signup
);

router.post(
  '/login',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  login
);

router.get('/signout', signOut);
router.use(errors());

module.exports = router;
