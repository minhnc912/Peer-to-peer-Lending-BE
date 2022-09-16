const AuthenticationService = require('../service/authentication')
const OTPService = require('../service/otp.js')
const _ = require('lodash');
module.exports = {
  async verify_phone_number(req, res) {
    try {
      const user_id = req.user.id
      const user = await AuthenticationService.get_user(user_id)
      const otp_id = await OTPService.verify_phone_number(user)
      res.status(200).send(otp_id)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },

  async verify_otp(req, res) {
    try {
       const message = await OTPService.verify_OTP(req)
       res.status(200).send(message)
    } catch (error) {
       res.status(400).send(error.message)
    }
 },

 async resend_otp(req, res) {
    try {
       const response = await OTPService.resendOtp(req)
       res.status(200).send(response)
    } catch (error) {
       res.status(400).send(error.message)
    }
 },

 async test(req, res){
   try {
      const response = await OTPService.testSMS(req)
      res.status(200).send(response)
   } catch (error) {
      res.status(400).send(error.message)
   }
 }

};