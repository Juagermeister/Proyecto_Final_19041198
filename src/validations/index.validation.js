'use strict'

const Joi = require('joi')

const defaultJoi = Joi.defaults((schema) => {
  return schema.error(errors => {
    errors.forEach(err => {
      switch (err.type) {
        case "string.base":
          err.message = "Requerido";
          break;
        case "any.empty":
          err.message = "Requerido";
          break;
        case "string.min":
          err.message = `Mínimo ${err.context.limit} caracteres`;
          break;
        case "string.max":
          err.message = `Máximo ${err.context.limit} caracteres`;
          break;
        case "string.email":
          err.message = `Correo inválido`;
          break;
        case "date.base":
          err.message = `Fecha inválida`;
          break;
        default:
          break;
      }
    });
    return errors;
  });
});

module.exports = defaultJoi
