'use strict'

const express = require('express')
const router = express.Router()
const { upload, getListFiles, download } = require('../../controllers/files.controller')
const validator = require('express-validation')
const auth = require('../../middlewares/authorization')

router.post("/upload", auth(), upload);
router.get("/files", auth(), getListFiles);
router.get("/files/:name", auth(), download);

module.exports = router
