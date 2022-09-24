require('dotenv').config()
let aws = require('aws-sdk')
const MailService = require('../service/mail')


async function sendSms(user, body) {
    aws.config.update({
        accessKeyId: process.env.ACCESS_KEY_ID_SNS,
        secretAccessKey: process.env.ACCESS_SCERET_KEY_SNS,
        region: process.env.REGION_S3
      });
    const content = 'your OTP is ' + body
    // MailService.send_mail(user.email, "Your OTP", content)
    console.log(`Sending SMS. Phone: ${user.phone_number}, body: ${body}`);
    var params = {
        Message: body,
        PhoneNumber: "+84329907231",
        MessageAttributes: {
            'AWS.SNS.SMS.SenderID': {
                'DataType': 'String',
                'StringValue': "OTP"
            },
            'AWS.SNS.SMS.SMSType': {
                'DataType': 'String',
                'StringValue': "Transactional"
            }
        }
    };    
    var publishTextPromise = new aws.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
    publishTextPromise.then(
        function (data) {
           return data.MessageId
        }).catch(
            function (err) {
                return err 
            });
}

module.exports = {
    sendSms: sendSms,
}