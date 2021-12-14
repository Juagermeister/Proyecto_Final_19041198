'use strict';

const express = require('express');
const router = express.Router();
const estados = require('../../controllers/estados.controller');
const validator = require('express-validation');
const auth = require('../../middlewares/authorization');

router.get('/', estados.get);
router.get('/getById', estados.getById);
router.post('/create', estados.create);
router.put('/update', estados.update);

module.exports = router;
