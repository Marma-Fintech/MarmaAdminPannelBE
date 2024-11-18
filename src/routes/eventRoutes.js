const express = require("express");
const {
  getAllEvents,
  deleteEvent,
  eventLink,
} = require("../controllers/eventController");
const { celebrate, Joi, Segments,errors } = require("celebrate");
const router = express.Router();


router.get("/event/gettallevent", getAllEvents);

router.delete(
  "/event/:id",
  celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().hex().length(24).required(), // Assuming MongoDB ObjectId format
    }),
  }),
  deleteEvent
);

router.post("/eventLink", celebrate({
  [Segments.BODY]: Joi.object().keys({
    link: Joi.string().uri().required()
  })
}),
eventLink
);

router.use(errors());

module.exports = router;