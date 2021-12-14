'use strict'
const httpStatus = require('http-status')
const Categorias = require('../models/categorias.model')
const Users = require('../models/user.model')
const { interfaces } = require('mocha')
const { parse } = require('mustache')
const mongoose = require('mongoose')


exports.getScore = async (req, res, next) => {

  const user = req.user;
  try {
    const recomendacionesTerminadas = await Tareas.find({
      user: user._id
    });
    const pendientes = await Recomendaciones.count({ _id: { $nin: recomendacionesTerminadas.map((rec) => rec.recomendacion) }, estatus: 'activo' });
    const terminadas = await Recomendaciones.count({ _id: { $in: recomendacionesTerminadas.map((rec) => rec.recomendacion) } });
    const categorias = await Categorias.find();
    const total = pendientes + terminadas;
    const score = (((terminadas / total) * 100)).toFixed(0);
    const scoreLess = parseFloat(100 - parseInt(score)).toFixed(0);
    let nivel = 0;
    const scoreInt = ((terminadas / total) * 100);
    if (!isNaN(scoreInt)) {
      const entro = false;
      for (let cat of categorias) {
        nivel++;
        if (scoreInt >= cat.min && scoreInt <= cat.max) {
          cat.tu = "TU";
          break;
        }
      }
    }
    else {
      categorias[0].tu = "TU";
    }

    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: '',
      data: {
        pendientes,
        terminadas,
        total,
        score,
        scoreLess,
        categorias,
        nivel
      }
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.updateUsuario = async (req, res, next) => {
  try {
    const body = req.body
    let usuario = await Users.findOne({ _id: body._id })
    Object.assign(usuario, body)
    await usuario.save()
    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: 'Usuario actualizado',
      data: {
        usuario
      }
    })
  } catch (error) {
    console.log(error)
  return next(error)
  }
}

exports.getDashboard = async (req, res, next) => {

  try {

    const recomendacionesTerminadas = await Tareas.find({
      user: req.params.id
    });
    const registrados = await Users.find({
      $or: [{ "profile.invitador": req.params.id }, { "profile.invitador": mongoose.Types.ObjectId(req.params.id) }]
    });
    const recomendacionesTerminadasReferidos = await Tareas.find({
      user: { $in: registrados.map((reg) => reg._id) }
    });

    const totalRegistrados = await Users.countDocuments({ $or: [{ "profile.invitador": req.params.id }, { "profile.invitador": mongoose.Types.ObjectId(req.params.id) }] });
    const totalReferidos = await Invitaciones.countDocuments({ "invitador": mongoose.Types.ObjectId(req.params.id) });
    const totalApoyos = await Tareas.countDocuments({ "user": mongoose.Types.ObjectId(req.params.id), active: true });
    const apoyosRegistrados = await Tareas.count({ user: { $in: registrados.map((reg) => reg._id) } });

    const apoyosSemana = await Tareas.aggregate([
      { $match: { "user": mongoose.Types.ObjectId(req.params.id), active: true } },
      { $group: { _id: { $isoDayOfWeek: "$fecha" }, total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    const apoyosPlataforma = await Tareas.aggregate([
      {
        $lookup:
        {
          from: "recomendaciones",
          localField: "recomendacion",
          foreignField: "_id",
          as: "tareas_recomendacion"
        }
      },
      { $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$tareas_recomendacion", 0] }, "$$ROOT"] } } },
      { $match: { user: mongoose.Types.ObjectId(req.params.id), active: true } },
      { $group: { _id: "$plataforma", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const pendientes = await Recomendaciones.count({ _id: { $nin: recomendacionesTerminadas.map((rec) => rec.recomendacion) }, estatus: 'activo' });
    const terminadas = await Recomendaciones.count({ _id: { $in: recomendacionesTerminadas.map((rec) => rec.recomendacion) }, estatus: 'activo' });
    const total = pendientes + terminadas;
    let score = (((terminadas / total) * 100)).toFixed(0);
    if (isNaN(score))
      score = "0";

    const pendientesReferidos = await Recomendaciones.count({ _id: { $nin: recomendacionesTerminadasReferidos.map((rec) => rec.recomendacion) }, estatus: 'activo' });
    const terminadasReferidos = await Recomendaciones.count({ _id: { $in: recomendacionesTerminadasReferidos.map((rec) => rec.recomendacion) }, estatus: 'activo' });
    const totalR = pendientesReferidos + terminadasReferidos;
    let scoreReferidos = (((terminadasReferidos / totalR) * 100)).toFixed(0);
    if (isNaN(scoreReferidos))
      scoreReferidos = "0";

    // console.log("Id: ", req.params.id);
    // console.log("recomendacionesTerminadasReferidos: ", recomendacionesTerminadasReferidos.length);
    // console.log("totalregistrados: ", totalRegistrados);
    // console.log("totalReferidos: ", totalReferidos);
    // console.log("totalApoyos: ", totalApoyos);
    // console.log("registrados: ", registrados);
    // console.log("apoyosRegistrados: ", apoyosRegistrados);
    // console.log("score: ", score);
    // console.log("scoreReferidos: ", scoreReferidos);
    // console.log("apoyos Semana: ", apoyosSemana);
    // console.log("apoyosPlataformas: ", apoyosPlataforma);
    // console.log("pendientes: ", pendientes);
    // console.log("terminadas: ", terminadas);
    // console.log("total: ", total);

    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: '',
      data: {
        score,
        scoreReferidos,
        totalRegistrados,
        totalReferidos,
        totalApoyos,
        apoyosRegistrados,
        apoyosSemana,
        apoyosPlataforma,
        pendientes,
        terminadas,
        total,
      }
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.getHomeCandidato = async (req, res, next) => {
  //console.log("hola");
  const user = req.user;
  try {
    const cantSecciones = await Seccionales.count();
    const categorias = await Categorias.find().lean();

    //console.log({ cantSecciones, categorias });
    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: '',
      data: {
        cantSecciones,
        categorias
      }
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.getInvitados = async (req, res, next) => {
  const user = req.user;
  try {
    const invitados = await Users.find({ invitador_id: user._id });
    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: '',
      data: {
        invitados
      }
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.getTodos = async (req, res, next) => {
  try {
    const todos = await Users.find({});
    res.status(httpStatus.CREATED)
    res.send({
      success: true,
      message: '',
      data: {
        todos
      }
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.getUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Users.find({ rol: 'user' });
    res.send({
      success: true,
      message: '',
      data: {
        usuarios
      }
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.findUsuarios = async (req, res, next) => {
  try {
    const searchRegExp = new RegExp(req.params.search.replace(' ', '|'), 'i');
    const usuarios = await Users.find({
      rol: 'user', $or: [
        { nombres: searchRegExp },
        { apellidoPaterno: searchRegExp },
        { ApellidoMaterno: searchRegExp },
      ]
    });
    res.send({
      success: true,
      message: '',
      data: {
        usuarios
      }
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.desactivar = async (req, res, next) => {
  try {
    const usuario = await Users.findOne({ _id: req.params.id });
    if (!usuario) {
      throw `El usuario ${req.params.id} no existe`;
    }
    usuario.active = false;
    await usuario.save();
    res.send({
      success: true,
      message: 'Usuario desactivado',
      data: {}
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}

exports.reactivar = async (req, res, next) => {
  try {
    const usuario = await Users.findOne({ _id: req.params.id });
    if (!usuario) {
      throw `El usuario ${req.params.id} no existe`;
    }
    usuario.active = true;
    await usuario.save();
    res.send({
      success: true,
      message: 'Usuario reactivado',
      data: {}
    })
  } catch (error) {
    console.log(error);
    return next(error)
  }
}
