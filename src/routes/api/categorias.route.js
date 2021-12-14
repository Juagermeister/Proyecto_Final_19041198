'use strict'

const express = require('express')
const router = express.Router()
const categorias = require('../../controllers/categorias.controller')
const validator = require('express-validation')
const auth = require('../../middlewares/authorization')

router.get('/', auth(), categorias.get)
router.post('/', auth(), categorias.create)

module.exports = router
