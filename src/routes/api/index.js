'use strict';
const express = require('express');
const router = express.Router();
const authRouter = require('./auth.route');
const usersRouter = require('./users.route');
const categoriasRouter = require('./categorias.route');
const estadosRouter = require('./estados.route');
const filesRouter = require('./files.route');
const municipiosRouter = require('./municipios.route');

router.get('/status', (req, res) => {
  res.send({ status: 'OK', nameApi: 'sistema', fechaVersion: '1-Febrero' });
}); // api status
router.use('/files', filesRouter);
router.use('/auth', authRouter); // mount auth paths

router.use('/users', usersRouter);
router.use('/categorias', categoriasRouter);
router.use('/estados', estadosRouter);
router.use('/municipios', municipiosRouter);

module.exports = router;
