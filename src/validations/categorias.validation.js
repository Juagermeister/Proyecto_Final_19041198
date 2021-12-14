'use strict'

const Joi = require('./index.validation');

// User validation rules
module.exports = {
  create: {
    body: {
      nombre: Joi.string().max(50).required()
    }
  }
}
