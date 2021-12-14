'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const categoriasScheme = new Schema({
  nombre: {
    type: String,
    maxlength: 50
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  },
  tu: {
    type: String,
    maxlength: 10
  },
  color: {
    type: Array
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('categorias', categoriasScheme)
