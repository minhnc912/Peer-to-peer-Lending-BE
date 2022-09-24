const { 
  authenticationController, 
  borrowRequestController, 
  investmentRequestController, 
  otpController,  
  notificationController,
  accountHistoryController,
  paymentController
 } = require('../view');
module.exports = (app) => {
  app.get('/api', (req, res) => res.status(200).send({
    message: 'Welcome to the p2p API!',
  }));
  app.use(function (req, res, next) {
    req.header.token
    next()
  })
  app.post('/api/login', authenticationController.login);
  app.get('/api/test', otpController.test);
  app.post('/api/user/update_information', authenticationController.update_information);
  app.post('/api/user/update_identification', authenticationController.update_identification);
  app.get('/api/get_signed_s3', authenticationController.get_signed_url);
  app.get('/api/get_dowload_url', authenticationController.get_dowload_url);
  app.post('/api/get_signed_s3', authenticationController.get_post_url);
  app.get('/api/user/get_detail', authenticationController.get_user_detail);

  // app.get('/api/lending/borrow_request/test', borrowRequestController.test);
  app.post('/api/lending/borrow_request/create', borrowRequestController.create);
  app.get('/api/lending/borrow_request/list', borrowRequestController.list);
  app.get('/api/lending/borrow_request/:id/your_borrow_requests', borrowRequestController.list_your_borrow_request);
  app.post('/api/lending/borrow_request/:id/start_now', borrowRequestController.start_now);
  app.post('/api/lending/borrow_request/:id/cancel', borrowRequestController.cancel);
  app.get('/api/lending/borrow_request/:id/pre_for_payment', borrowRequestController.pre_for_payment);
  app.post('/api/lending/borrow_request/:id/payment', borrowRequestController.payment);
  app.get('/api/lending/borrow_request/:id', borrowRequestController.getDetail);


  app.post('/api/lending/invest_request/create', investmentRequestController.create);
  app.get('/api/lending/invest_request/:id', investmentRequestController.getDetail);

  app.post('/api/otp/verify_phone', otpController.verify_phone_number);
  app.post('/api/otp/verify_otp', otpController.verify_otp);
  app.post('/api/otp/resend_otp', otpController.resend_otp);
  
  app.get('/api/notification', notificationController.list);
  app.post('/api/notification', notificationController.mark_has_read);

  app.get('/api/account_history', accountHistoryController.list);

  app.post('/api/payment/create_url_payment', paymentController.create_url_payment);
  app.get('/api/payment/payment_return', paymentController.payment_return);

  app.post('/api/payment/create_widthdraw_request', paymentController.create_withdraw_request);
  app.get('/api/payment/get_list_widthdraw_request', paymentController.get_list_withdraw_request);
};