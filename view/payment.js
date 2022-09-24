const paymentService = require('../service/payment')
const _ = require('lodash');
const withdraw_request = require('../models/withdraw_request');
module.exports = {
  async create_url_payment(req, res) {
    try {
      const url = await paymentService.create_payment_url(req)
      res.status(200).send(url)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },

  async payment_return(req, res) {
    try {
       const message = await paymentService.payment_return(req)
       res.status(200).send(message)
    } catch (error) {
       res.status(400).send(error.message)
    }
 },

 async payment_return(req, res) {
  try {
     const message = await paymentService.payment_return(req)
     res.status(200).send(message)
  } catch (error) {
     res.status(400).send(error.message)
  }
},

async create_withdraw_request(req, res) {
  try {
     const data = await paymentService.create_withdraw_request(req)
     res.status(200).send(data)
  } catch (error) {
     res.status(400).send(error.message)
  }
},
async get_list_withdraw_request(req, res) {
  try {
     const lists = await paymentService.get_list_withdraw_request(req)
     res.status(200).send(lists)
  } catch (error) {
     res.status(400).send(error.message)
  }
},
};