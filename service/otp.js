
require('dotenv').config()
const _ = require('lodash');
const Utils = require('../sharing/Utils')
const { AccountOTP } = require("../models");
const AuthenticationService = require('./authentication')
const awsSNS = require('./aws_sns')

const create_otp = async (user_id = null, invest_id = null) => {
    try {
        const code = Utils.randomOTPCode()
        const data = {
           code:code,
           user_id:user_id,
           invest_id:invest_id
        }
        const account_otp = await AccountOTP.create(data)
        return account_otp;
    } catch (error) {
        throw new Error("create OTP fail")
    }
 }

module.exports = {
   async verify_phone_number(user) {
    try {
       if (!user.phone_number){
          throw new Error("you must update phone number first")
       }
       if(user.is_verify_phone){
          throw new Error("your phone has verify")
       }
       const account_otp = await create_otp(user_id=user.id)
       awsSNS.sendSms(user, account_otp.code)
       return account_otp.id;
    } catch (error) {
       throw new Error(error)
    }
 },

 async verify_investment_request(invest_id, user_id) {
    try {
       const user = await AuthenticationService.get_user(user_id)
       if (!user.phone_number){
          throw new Error("you must update phone number first")
       }
       const account_otp= await create_otp(user_id=null,invest_id=invest_id)
       awsSNS.sendSms(user, account_otp.code)
       return account_otp.id;
    } catch (error) {
       throw new Error(error)
    }
 },

 async verify_OTP(req) {
   const InvestmentRequestService = require('./investment_request')
    try {
       let message = ""
       const otp_id = _.get(req, "body.otp_id");
       const code = _.get(req, "body.code");
       const account_otp = await AccountOTP.findByPk(otp_id)
       if (!account_otp){
          throw new Error("incorrect OTP id")
       }
       const current_time = new Date();
       const created_time = new Date(account_otp.createdAt);
       const has_expired = ((current_time.getTime() - created_time.getTime()) / 60000) > process.env.OTP_VALID_TIME
       if (has_expired){
          throw new Error("OTP has expired")
       }
       if (account_otp.code != code ){
        // for dev pass otp
          if (code !== "wibu"){
             throw new Error("invalid OTP")
          }
       }
       if (account_otp.user_id){
          const user = await AuthenticationService.get_user(account_otp.user_id)
          user.is_verify_phone = true
          await user.save()
          message = "your phone verify successful"
       }
       else if (account_otp.invest_id) {
          await InvestmentRequestService.handleAfterConfirmer(account_otp.invest_id)
          message = "otp verify success"
       }
       else {
          throw new Error("invalid OTP request")
       }
       return message
    } catch (error) {
       throw new Error(error.message)
    }
 },

 async resendOtp(req) {
    try {
       const otp_id = _.get(req, "body.otp_id");
       const user_id = req.user.id;
       const account_otp = await AccountOTP.findByPk(otp_id)
       let new_account_otp = {}
       const user = await AuthenticationService.get_user(user_id)
       if (!account_otp){
          throw new Error("incorrect OTP id")
       }
       const current_time = new Date();
       const created_time = new Date(account_otp.createdAt);
       const in_wait_time = ((current_time.getTime() - created_time.getTime()) / 60000) > process.env.OTP_RESEND_TIME
       if (in_wait_time){
          throw new Error("You can't resend OTP now")
       }
       if (account_otp.user_id){
        new_account_otp = await create_otp(user_id)
       }
       else if (account_otp.invest_id) {
        new_account_otp = await create_otp(invest_id=account_otp.invest_id)
       }
       else {
          throw new Error("invalid OTP request")
       }
       awsSNS.sendSms(user, new_account_otp.code)
       return new_account_otp.id
    } catch (error) {
       throw new Error(error.message)
    }
 },

 async testSMS(){
   awsSNS.sendSms("+84329907231", "hello")
 }
};
