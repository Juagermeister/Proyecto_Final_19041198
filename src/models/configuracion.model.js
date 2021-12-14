'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const configuracionScheme = new Schema({
  codigo: {
    type: String,
    maxlength: 10
  },
  usuario: {
    type: String
  },
}, {
  timestamps: true
})

module.exports = mongoose.model('configuracion', configuracionScheme, 'configuracion')