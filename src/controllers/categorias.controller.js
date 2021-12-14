'use strict'
const httpStatus = require('http-status')
const Categorias = require('../models/categorias.model')

exports.create = async (req, res, next) => {
  //console.log(req.body);
  try {
    const body = req.body
    const categoria = new Categorias(body)
    const savedItem = await categoria.save()
    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: 'Categoría creada!'
    })
  } catch (error) {
    return next(error)
  }
}

exports.get = async (req, res, next) => {
  const user = req.user;
  try {
    const categorias = await Categorias.find();
    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: '',
      data: {
        categorias
      }
    })
  } catch (error) {
    return next(error)
  }
}

