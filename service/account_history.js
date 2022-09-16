require('dotenv').config()
const _ = require('lodash');
const { AccountHistory, Account, AccountInformation } = require("../models");
const { NOTIFICATION_TYPE, ACCOUNT_TYPE } = require('../constant');

module.exports = {
    async create_history(user_id, notification_type, type_account, content, invest_id, ) {
     try {
        const data = {
            user_id, type_noti:notification_type, type_account, content, invest_id, 
        }
        await AccountHistory.create(data)
        return "done"
     } catch (error) {
         console.log(error)
     } 
    },
    async bulk_create_history(data){
        try {
            await AccountHistory.bulkCreate(data) 
        } catch (error) {
            console.log(error)
        }
    },
    async get_list_account_history(req){
        try {
            const user_id = req.user.id
            const type_account = _.get(req, "query.type_account", 0)
            const page =  _.get(req, "query.page", 1)
            const limit =  _.get(req, "query.limit", 5)
            const offset = (page -1) * limit
            const {count, rows}  = await AccountHistory.findAndCountAll({
                include:[
                    {
                        model:AccountInformation,
                        required: true,
                        where:{
                            user_id:user_id,
                            type:type_account
                        }
                    }
                ],
                order: [
                    ['id','DESC']
                ],
                offset:offset,
                limit:limit
            })
            return {count, rows};
        } catch (error) {
            throw new Error(error.message) 
        }
    }
 };
 
