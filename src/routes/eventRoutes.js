const express = require('express');
const { postEvent,getAllEvents, deleteEvent, getUpcomingEvents, getPassedEvents } = require('../controllers/eventController');
const { celebrate, Joi, Segments } = require("celebrate");
const {upload} = require("../utils/multer")

const router = express.Router();

router.post(
  "/event",
  upload.single("image"), // Use multer to handle file upload
  celebrate({
    [Segments.BODY]: Joi.object().keys({
      title: Joi.string().required(),
      link: Joi.string().uri().required(),
      description: Joi.string().required(),
     // date: Joi.date().required(), // Ensure the date is required
     date: Joi.date().iso().required(), // Ensure date format (ISO 8601) is required
    }),
  }),
  postEvent
);
router.get(
  "/event/gettallevent",
  getAllEvents
);

router.delete(
    "/event/:id",
    celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().hex().length(24).required(), // Assuming MongoDB ObjectId format
    }),
  }),
    deleteEvent
  );
  router.get(
    "/event/upcommingevent",
    getUpcomingEvents
  );

  router.get(
    "/event/passedevents",
    getPassedEvents
  );
  

module.exports = router;
