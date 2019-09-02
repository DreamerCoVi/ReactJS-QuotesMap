const express = require('express');
const Joi = require('joi');

const db = require('../db');

const quotes = db.get('quotes');

const schema = Joi.object().keys({ // validation
  name: Joi.string().regex(/^[a-zA-Z0-9 -_]{1,30}$/).required(),
  quote: Joi.string().regex(/^[a-zA-Z0-9`!'" -_]{1,500}$/).required(),
  latitude: Joi.number().min(-90).max(90),
  longitude: Joi.number().min(-180).max(180),
  date: Joi.date()
});

const router = express.Router();

router.get('/', (req, res) => {
  quotes
    .find()
    .then((allquotes) => {
      res.json(allquotes);
    });
});

router.post('/', (req, res, next) => {
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    const {
      name, quote, latitude, longitude
    } = req.body;
    const userquote = {
      name,
      quote,
      latitude,
      longitude,
      date: new Date()
    };
    quotes
      .insert(userquote)
      .then((insertedquote) => {
        res.json(insertedquote);
      });
  } else {
    next(result.error);
  }
});
module.exports = router;
