const authenticationController = require('./authentication');
const borrowRequestController = require('./borrow_request');
const investmentRequestController = require('./investment_request');
const otpController = require('./otp');
const notificationController = require('./notification');
const accountHistoryController = require('./account_history.js');
const paymentController = require('./payment.js');
module.exports = {
    authenticationController,
    borrowRequestController,
    investmentRequestController,
    otpController,
    notificationController,
    accountHistoryController,
    paymentController
};