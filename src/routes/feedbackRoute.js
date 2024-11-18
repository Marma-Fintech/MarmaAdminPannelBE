const express = require("express");
const { celebrate, Joi, Segments, errors } = require("celebrate");
const { createFeedback, getAllfeedback } = require("../controllers/feedbackController");
const router = express.Router();

router.post(
  "/feedback",
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email({ tlds: { allow: false } }).required(),
      message: Joi.string().required(),
    }),
  }),
  createFeedback
);

router.get("/feedback/gettallfeedback", getAllfeedback);


router.use(errors()); 
module.exports = router;