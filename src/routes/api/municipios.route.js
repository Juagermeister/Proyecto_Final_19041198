'use strict'
const express = require('express')
const router = express.Router()

const municipios = require('../../controllers/municipios.controller')

router.post('/create', municipios.InsertMunicipio)
router.put('/update', municipios.UpdateMunicipio)
router.get('/', municipios.getMunicipio)
router.get('/id', municipios.getMunicipioById)

module.exports = router;
