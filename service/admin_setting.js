const _ = require('lodash');
const db = require("../models");
const AdminSetting = db.AdminSetting;
const ADMIN_SETTING_TYPE = require("../constant").ADMIN_SETTING_TYPE;

module.exports = {
    async getAdminSetting () {
        let admin_setting = {}
        let where = {
            is_active: true, 
        }
        const interest_rate_setting = await AdminSetting.findAll(
            {
                attributes: ['value', "type"]
            },
            {
                where
            })
            interest_rate_setting.forEach(item => {
             if (item.type == ADMIN_SETTING_TYPE.MAX_INTERESTED_RATE ){
                admin_setting.max_interest_rate = parseFloat(item.value)
             }
             else if (item.type == ADMIN_SETTING_TYPE.MIN_INTERESTED_RATE){
                admin_setting.min_interest_rate = parseFloat(item.value)
             }
             else if (item.type == ADMIN_SETTING_TYPE.MIN_LENDING_EXPECTED_MONEY){
                admin_setting.min_lending_expected_money = parseInt(item.value)
             }
             else if (item.type == ADMIN_SETTING_TYPE.MIN_INVEST_MONEY){
                admin_setting.min_invest_money = parseInt(item.value)
             }
             else if (item.type == ADMIN_SETTING_TYPE.DISCOUNT_RATE){
                admin_setting.discount_rate = parseFloat(item.value)
             }
             else if (item.type == ADMIN_SETTING_TYPE.DEFAULT_LIMIT_MONEY_FOR_NEW_MEMBER){
                admin_setting.default_limit_money = parseFloat(item.value)
             }
        });
    
        return admin_setting
    }
    
};
