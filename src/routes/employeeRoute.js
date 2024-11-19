const express = require('express');
const { signup, login, forgotPassword, signOut } = require('../controllers/employeeController');
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

router.post(
  '/forgotPassword',
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      newPassword: Joi.string().min(6).required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({ 'any.only': 'Passwords do not match' }),
    }),
  }),
  forgotPassword
);

router.get('/signout', signOut);

router.use(errors());

module.exports = router;
