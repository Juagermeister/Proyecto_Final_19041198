'use strict'

const User = require('../models/user.model')
//const Configuracion = require('../models/configuracion.model')
const jwt = require('jsonwebtoken')
const config = require('../config')
const httpStatus = require('http-status')
const uuidv1 = require('uuid/v1')

exports.register = async (req, res, next) => {
  try {
    const configuracion = await Configuracion.findOne({});
    if (String(req.body.codigo).toLocaleLowerCase().trim() == configuracion.codigo) {
      try {
        const activationKey = uuidv1()
        const body = req.body
        body.activationKey = activationKey
        body.profile = {
          invitador: configuracion.usuario,
          codigo: configuracion.codigo,
          tareasTerminadas: 0
        }
        //await Invitaciones.updateOne({ _id: invitacion._id }, { $set: { estatus: "Usado" } });
        const user = new User(body)
        const savedUser = await user.save()
        res.status(httpStatus.CREATED)
        res.send(savedUser.transform())
      } catch (e) {
        console.log(e);
      }
    }
    else {

      const invitacion = await Invitaciones.findOne({
        codigo: req.body.codigo,
        celular: req.body.celular
      });

      if (!invitacion) {
        // CODIGO NO SE ENCUENTRA
        res.status(httpStatus.NOT_FOUND)
        res.send({ success: false, message: "Código o Celular no encontrado", content: "Verifique el código con la persona que lo invitó." });
      } else if (invitacion.estatus == "Usado") {
        // CODIGO USADO
        res.status(httpStatus.UNAUTHORIZED)
        res.send({ success: false, message: 'Código usado', content: "Este código ya fue usado, necesitará uno nuevo." })
      } else {
        // CODIGO BUENO
        try {
          const activationKey = uuidv1()
          const body = req.body
          body.activationKey = activationKey
          body.profile = {
            invitador: invitacion.invitador,
            codigo: invitacion.codigo,
            tareasTerminadas: 0
          }
          await Invitaciones.updateOne({ _id: invitacion._id }, { $set: { estatus: "Usado" } });
          const user = new User(body)
          const savedUser = await user.save()
          res.status(httpStatus.CREATED)
          res.send(savedUser.transform())
        } catch (e) {
          console.log(e);
        }
      }
    }
  } catch (error) {
    return next(User.checkDuplicateEmailError(error))
  }
}

exports.invitar = async (req, res, next) => {
  try {
    //console.log(req.user);
    const activationKey = uuidv1()
    const body = req.body
    body.activationKey = activationKey
    body.codigoInvitacion = Math.floor((Math.random() * 9000) + 1000)
    body.password = "holacrayola"
    body.invitador_id = req.user.id
    const user = new User(body)
    const savedUser = await user.save()
    res.status(httpStatus.CREATED)
    res.send(savedUser.transform())
  } catch (error) {
    console.log(error);
    return next(User.checkDuplicateEmailError(error))
  }
}

exports.login = async (req, res, next) => {
  try {
    const user = await User.findAndGenerateToken(req.body)
    const payload = { sub: user.id }
    const token = jwt.sign(payload, config.secret)
    return res.json({ success: true, message: 'OK', token: token, user })
  } catch (error) {
    next(error)
  }
}

exports.confirm = async (req, res, next) => {
  try {
    await User.findOneAndUpdate(
      { 'activationKey': req.query.key },
      { 'active': true }
    )
    return res.json({ message: 'OK' })
  } catch (error) {
    next(error)
  }
}

exports.changePassword = async (req, res, next) => {
  try {
    let user;
    user = await User.findOne({ _id: req.user._id })
    user.password = req.body.password
    await user.save()
    res.send({
      success: true,
      message: 'Tu contraseña fué cambiada'
    })
  } catch (error) {
    next(error)
  }
}

exports.resetPasswordConEmailOCelular = async (req, res, next) => {
  try {
    let user;
    if (req.body.email) {
      user = await User.findOne({ email: req.body.email })
    } else if (req.body.celular) {
      user = await User.findOne({ celular: req.body.celular })
    }
    if (user) {
      const codigo = Math.floor((Math.random() * 9000) + 1000)
      let fechaDeVencimiento = new Date()
      fechaDeVencimiento.setHours(fechaDeVencimiento.getHours() + 1);
      user.resetPassword = {
        codigo,
        fechaDeVencimiento
      }
      await user.save()
      await smsController.sendResetPasswordCode(codigo, user.celular)
      res.send({
        success: true,
        message: 'Recibirás un código en tu celular'
      })
    } else {
      res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: 'El usuario no existe'
      })
    }

  } catch (error) {
    next(error)
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    let user;
    if (req.body.email) {
      user = await User.findOne({ email: req.body.email })
    } else if (req.body.celular) {
      user = await User.findOne({ celular: req.body.celular })
    }
    if (user && user.resetPassword && user.resetPassword.codigo == req.body.codigo) {
      if (user.resetPassword.fechaDeVencimiento < new Date()) {
        return res.send({
          success: false,
          message: 'Código expirado'
        })
      }
      user.password = req.body.password
      await user.save()
      res.send({
        success: true,
        message: 'Tu contraseña fué cambiada'
      })
    } else {
      res.status(httpStatus.NOT_FOUND).send({
        success: false,
        message: 'Código no encontrado'
      })
    }

  } catch (error) {
    next(error)
  }
}
