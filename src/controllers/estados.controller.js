'use strict';
const httpStatus = require('http-status');
const Estados = require('../models/estados.model');

exports.create = async (req, res, next) => {
  try {
    const body = req.body;
    const estados = new Estados(body);
    const savedItem = await estados.save();
    res.status(httpStatus.CREATED);
    res.send({
      success: true,
      message: 'Estados creado!',
    });
  } catch (error) {
    return next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const body = req.body;
    let estado = await Estados.findOne({ _id: body._id });
    Object.assign(estado, body);
    await estado.save();
    res.status(httpStatus.CREATED);
    res.send({
      success: true,
      message: 'Estados actualizado!',
    });
  } catch (error) {
    return next(error);
  }
};

exports.getById = async (req, res, next) => {
  const user = req.user;
  try {
    const body = req.body;
    const estado = await Estados.findOne({ _id: body._id });

    res.status(httpStatus.CREATED);
    res.send({
      success: true,
      message: '',
      data: {
        estado,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.get = async (req, res, next) => {
  const user = req.user;
  try {
    const estados = await Estados.find();

    res.status(httpStatus.CREATED);
    res.send({
      success: true,
      message: '',
      data: {
        estados,
      },
    });
  } catch (error) {
    return next(error);
  }
};
