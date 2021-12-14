'use strict'
const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const httpStatus = require('http-status')
const APIError = require('../utils/APIError')
const transporter = require('../services/transporter')
const config = require('../config')
const Schema = mongoose.Schema

const roles = [
  'user', 'admin', 'redes', 'candidato'
]

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 100
  },
  nombres: {
    type: String,
    maxlength: 50,
    required: true,
  },
  apellidoPaterno: {
    type: String,
    maxlength: 50
  },
  apellidoMaterno: {
    type: String,
    maxlength: 50
  },
  domicilio: {
    type: {
      calle: {
        type: String,
        maxlength: 50
      },
      numero: {
        type: String,
        maxlength: 5,
      },
      asentamiento: {
        type: Schema.Types.ObjectId
      },
      municipio: {
        type: Schema.Types.ObjectId
      },
      estado: {
        type: Schema.Types.ObjectId
      }
    }
  },
  fechaNacimiento: {
    type: Date
  },
  foto: {
    type: String
  },
  sexo: {
    type: String,
    required: true,
  },
  seccion: {
    type: String
  },
  celular: {
    type: String,
    required: true,
  },
  telefono: {
    type: String
  },
  activationKey: {
    type: String,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  },
  rol: {
    type: String,
    default: 'user',
    enum: roles
  },
  usuarioGenerico: {
    type: Boolean,
    default: false
  },
  ocupacion: {
    type: Schema.Types.ObjectId,
    required: true,
    maxlength: 50
  },
  nivelParticipacion: {
    type: Schema.Types.ObjectId,
    required: true,
    maxlength: 50
  },
  profile: {
    type: {
      tareasTerminadas: {
        type: Number
      },
      invitador: {
        type: String
      },
      codigo: {
        type: String
      },
    }
  },
  resetPassword: {
    type: {
      codigo: {
        type: String
      },
      fechaDeVencimiento: {
        type: Date
      }
    }
  }

}, {
  timestamps: true
})

userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) {
      return next()
    }

    this.password = bcrypt.hashSync(this.password)

    return next()
  } catch (error) {
    return next(error)
  }
})

userSchema.method({
  transform() {
    const transformed = {}
    const fields = ['id', 'nombre', 'email', 'createdAt', 'rol']

    fields.forEach((field) => {
      transformed[field] = this[field]
    })

    return transformed
  },

  passwordMatches(password) {
    return bcrypt.compareSync(password, this.password)
  }
})

userSchema.statics = {
  roles,

  checkDuplicateEmailError(err) {
    if (err.code === 11000) {
      var error = new Error('Email already taken')
      error.errors = [{
        field: 'email',
        location: 'body',
        messages: ['El correo']
      }]
      error.status = httpStatus.CONFLICT
      return error
    }

    return err
  },

  async findAndGenerateToken(payload) {
    const { email, password } = payload
    if (!email) throw new APIError('El correo es obligatorio')

    const user = await this.findOne({ email }).exec()
    if (!user) throw new APIError(`No existe el correo`, httpStatus.NOT_FOUND)

    const passwordOK = await user.passwordMatches(password)

    if (!passwordOK) throw new APIError(`Contraseña incorrecta`, httpStatus.UNAUTHORIZED)

    if (!user.active) throw new APIError(`Usuario desactivado`, httpStatus.UNAUTHORIZED)

    return user
  }
}

module.exports = mongoose.model('User', userSchema)
