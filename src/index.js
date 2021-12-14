'use strict';
global.__basedir = __dirname;
const mongoose = require('./services/mongoose');
const app = require('./services/express');
const _ = require('underscore');

// start app and connect to database
app.start();
mongoose.connect();

Array.prototype.toObject = function (key, val) {
  if (key === undefined) {
    throw new Error('Debes especificar la llave');
  }
  let obj = {};
  _.each(this, (item) => {
    obj[item[key]] = val ? item[val] : item;
  });
  return obj;
};

module.exports = app;
