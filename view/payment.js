const paymentService = require('../service/payment')
const _ = require('lodash');
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

};