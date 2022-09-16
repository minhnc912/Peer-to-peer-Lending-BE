require('dotenv').config()
const _ = require('lodash');
const { Notification } = require("../models");
const { NOTIFICATION_TYPE } = require('../constant');

module.exports = {
    async create_notification(user_id, notification_type, type_account, content, invest_id=0, borrow_id=0) {
     try {
        const data = {
            user_id, type_noti:notification_type, type_account, content, invest_id, borrow_id
        }
        await Notification.create(data)
        return "done"
     } catch (error) {
         console.log(error)
     }
    },
    async bulk_create_notification(data, t) {
        try {
           await Notification.bulkCreate(data, {transaction:t})
           return "done"
        } catch (error) {
            console.log(error)
        }
       },
    
    async get_notification(user_id, type_account) {
        try {
          const notifications =  await Notification.findAll({
            where:{
                user_id: user_id,
                type_account:type_account
            },
            order: [
                ['id','DESC']
            ],
          })
           return notifications
        } catch (error) {
            console.log(error)
        }
    },

    async mark_read(id) {
        try {
          await Notification.update({
            has_read:true
          },{
            where:{
                id
            }
          })
           return "done"
        } catch (error) {
            console.log(error)
        }
    },
 };
 
