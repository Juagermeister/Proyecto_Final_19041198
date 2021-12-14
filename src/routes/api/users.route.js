'use strict'

const express = require('express')
const router = express.Router()
const users = require('../../controllers/users.controller')
const validator = require('express-validation')
const auth = require('../../middlewares/authorization')

router.get('/usuarios', auth(), users.getUsuarios)
router.get('/find/:search', auth(), users.findUsuarios)
router.get('/score', auth(), users.getScore)
router.get('/homeCandidato', auth(), users.getHomeCandidato)
router.get('/invitados', auth(), users.getInvitados)
router.get('/todos', auth(), users.getTodos)
router.put('/desactivar/:id', auth(['redes']), users.desactivar)
router.put('/reactivar/:id', auth(['redes']), users.reactivar)
router.put('/', auth(), users.updateUsuario)


router.get('/dashboard/:id', auth(), users.getDashboard)

module.exports = router
