const cron = require('cron');
const BorrowRequestService = require('../borrow_request'); 

const borrowJob = new cron.CronJob({
  cronTime: '00 30 23 * * *', // Chạy Jobs vào 23h30 hằng đêm
  onTick: function() {
    console.log('Cron job runing...');
    BorrowRequestService.handle_start_request()
    BorrowRequestService.handle_end_request()
  },
  start: true, 
  timeZone: 'Asia/Ho_Chi_Minh'
});

console.log("job start")
borrowJob.start()