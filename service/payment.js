require('dotenv').config()
const _ = require('lodash');
const { NOTIFICATION_TYPE, TRANSACTION_METHOD, TRANSACTION_STATUS, TRANSACTION_TYPE } = require('../constant');
const { AccountPayment, AccountInformation, Account, Notification, AccountHistory} = require("../models");
const Utils = require('../sharing/Utils')
const db = require("../models")
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const sequelize = db.sequelize;
const moment = require('moment');
function sortObject(obj) {
	var sorted = {};
	var str = [];
	var key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = {
    async create_payment_url(req) {
     try {
    user_id = req.user.id    
    var ipAddr = '::ffff:127.0.0.1'
    
    var tmnCode = process.env.VNP_TmnCode;
    var secretKey = process.env.VNP_HashSecret;
    var vnpUrl = process.env.VNP_Url;
    var returnUrl = process.env.VNP_ReturnUrl;

    var createDate = moment().format('yyyymmddHHmmss');
    var orderId = Utils.randomId();
    var amount = req.body.amount;
    var bankCode = req.body.bankCode;
    
    var orderInfo = 'helo';
    var orderType = "topup";
    var locale = req.body.language;
    if(locale === null || locale === ''){
        locale = 'vn';
    }
    user_id = req.user.id  
    const user_type = _.get(req, "body.user_type");
    if (!(user_id && user_type)){
        throw new Error("required user_id and user_type")
    }
    const account_information = await AccountInformation.findOne({
        where:{
            user_id,
            type:user_type
        }
    })
    if (!account_information){
        throw new Error("invalid user_id or user_type")
    }
    var currCode = 'VND';
    var vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    // vnp_Params['vnp_Merchant'] = ''
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = orderType;
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if(bankCode !== null && bankCode !== ''){
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    const account_payment_data = {
        order_id:orderId,
        code_bank:"bankCode",
        note:"orderInfo",
        account_id:5,
        account_id:account_information.id,
        amount:1000
    }
    await AccountPayment.create(account_payment_data)

    vnp_Params = sortObject(vnp_Params);

    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");     
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
    return vnpUrl
     } catch (error) {
        throw new Error(error)
     }
  },
    async payment_return(req){
        var vnp_Params = req.query;

        var secureHash = vnp_Params['vnp_SecureHash'];
    
        delete vnp_Params['vnp_SecureHash'];
        delete vnp_Params['vnp_SecureHashType'];
    
        vnp_Params = sortObject(vnp_Params);
    
        var config = require('config');
        var tmnCode = config.get('vnp_TmnCode');
        var secretKey = config.get('vnp_HashSecret');
    
        var querystring = require('qs');
        var signData = querystring.stringify(vnp_Params, { encode: false });
        var crypto = require("crypto");     
        var hmac = crypto.createHmac("sha512", secretKey);
        var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
    
        if(secureHash === signed){
            const t = await sequelize.transaction();
            try {
                const orderId = vnp_Params['vnp_TxnRef'];
                const rspCode = vnp_Params['vnp_ResponseCode'];
                const account_payment = await AccountPayment.findOne({
                    where:{
                        order_id:orderId
                    }
                })
                account_payment.vnpay_code_response = rspCode
                const account_information = await AccountInformation.findByPk(account_payment.account_id)
                const user = await Account.findByPk(account_information.user_id)
                account_information.balance += account_payment.amount
                await account_payment.save({transaction:t})
                await account_information.save({transaction:t})
                const notification_data = {
                    user_id:account_information.user_id,
                    type_account: account_information.type,
                    content:"you have added "+ account_payment.amount+" to your account",
                    type_noti: NOTIFICATION_TYPE.ACCOUNT_HISTORY,
                }
                const account_history_data = {
                    account_id: account_information.id,
                    content: "RECIEVED from VNPAY",
                    amount: account_payment.amount,
                    sender_name: "VNPAY",
                    reciever_name:user.first_name + " " + user.last_name,
                    method: TRANSACTION_METHOD.OUT_SYSTEM,
                    type: TRANSACTION_TYPE.RECHANGE,
                    status: TRANSACTION_STATUS.SUCCESS
                }
                await Notification.create(notification_data, {transaction:t})
                await AccountHistory.create(account_history_data, {transaction:t})
                await t.commit();
            } catch (error) {
                await t.rollback();
            }
           return "success"
        } else{
            throw new Error("fail checksum")
        }
    },
    async vnpay_ipn(req){
    var vnp_Params = req.query;
    var secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    var config = require('config');
    var secretKey = config.get('vnp_HashSecret');
    var querystring = require('qs');
    var signData = querystring.stringify(vnp_Params, { encode: false });
    var crypto = require("crypto");     
    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");     
     

    if(secureHash === signed){
        return "success"
    }
    else {
        throw new Error("fail checksum")
    }
    },
 };