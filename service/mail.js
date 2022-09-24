
const nodeMailer = require('nodemailer')
require('dotenv').config()

const adminEmail = process.env.ADMIN_MAIL
const adminPassword = process.env.ADMIN_MAIL_PASSWORD

const mailHost = 'smtp.gmail.com'
const mailPort = 465
module.exports = {
    send_mail(to, subject, htmlContent) {
     try {
        const transporter = nodeMailer.createTransport({
            host: mailHost,
            port: mailPort,
            secure: true, 
            auth: {
              user: adminEmail,
              pass: adminPassword
            }
          })
        const options = {
            from: adminEmail,
            to: to, 
            subject: subject, 
            html: htmlContent 
          }
        transporter.sendMail(options,  function(err, info){
          if (err){
            throw new Error(err)
          }
          else{
            return info
          }
        })
     } catch (error) {
         console.log(error)
     }
    },
 };
 
