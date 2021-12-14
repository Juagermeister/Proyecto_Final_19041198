'use strict'

const Joi = require('./index.validation');

// User validation rules
module.exports = {
  create: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(50).required(),
      nombres: Joi.string().max(50).required(),
      apellidoPaterno: Joi.string().max(50).required(),
      domicilio: Joi.object({
        calle: Joi.string().required(),
        numero: Joi.string().required(),
        asentamiento: Joi.string().required(),
        municipio: Joi.string().required(),
        estado: Joi.string().required()
      }),
      ocupacion: Joi.string().max(50).required(),
      nivelParticipacion: Joi.string().max(50).required(), 
      fechaNacimiento: Joi.date().required(),
      sexo: Joi.string().required(),
      celular: Joi.string().max(50).required(),
      codigo: Joi.string().max(50).required()
    }
  },
  invitar: {
    body: {
      email: Joi.string().email().required(),
      nombres: Joi.string().max(50).required(),
      apellidoPaterno: Joi.string().max(50).required(),
      apellidoMaterno: Joi.string().max(50).required(),
      domicilio: Joi.object({
        calle: Joi.string().required(),
        numero: Joi.string().required(),
        asentamiento: Joi.string().required(),
        municipio: Joi.string().required(),
        estado: Joi.string().required()
      }),
      fechaNacimiento: Joi.date().required(),
      sexo: Joi.string().required(),
      celular: Joi.string().max(50).required()
    }
  },
  changePassword: {
    body: {
      password: Joi.string().min(6).max(50).required()
    }
  },
  resetPasswordConEmailOCelular: {
    body: {
      celular: Joi.string().min(10).max(10).required()
    }
  }
}
