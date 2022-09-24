
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require("firebase-admin");
const AWS = require("aws-sdk");
const serviceAccount = require("./cert/firebase-admin-config.json");
require('dotenv').config()
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_S3,
  secretAccessKey: process.env.SECRET_KEY_S3,
  region: process.env.REGION_S3
});

// Set up the express app
const app = express();

app.use(cors())
// Log requests to the console.
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  const firebaseAdminService = require("./service/firebase")
  firebaseAdminService.authorization(req, res, next)
})
require('./router')(app);

app.get('*', (req, res) => res.status(200).send({
    message: 'p2p lending sever v2.2',
  }));

module.exports = app;