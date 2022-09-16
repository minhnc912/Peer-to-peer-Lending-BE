require('dotenv').config()
let aws = require('aws-sdk')
const REGION = "ap-southeast-1";

aws.config.update({
    region: REGION,
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.ACCESS_SCERET_KEY
});

function sendSms(phoneNumber, body) {

    console.log(`Sending SMS. Phone: ${phoneNumber}, body: ${body}`);
    var params = {
        Message: body,
        PhoneNumber: phoneNumber,
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