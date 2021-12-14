'use strict'

const axios = require('axios');

const notificationApi = axios.create({
  baseURL: 'https://fcm.googleapis.com/fcm',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'key='+ process.env.FIREBASE_SERVER_KEY,
  }
});

exports.notificationApi = notificationApi;
