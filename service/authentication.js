const _ = require('lodash');
const { Account, AccountInformation, LendingRequest, InvestmentRequest, Category } = require("../models");
const { ACCOUNT_STATUS, ACCOUNT_TYPE, INVEST_STATUS, LENDING_STATUS } = require('../constant')
const AdminSettingService = require('./admin_setting')
require('dotenv').config()

module.exports = {
   async login(req) {
      try {
         const google_id = _.get(req, "body.user.googleId");
         const user_id = _.get(req, "body.user.id");
         let user = {};

         if (!google_id && !user_id) {
            throw new Error("user_id or googleId must required")
         }

         if (google_id) {
            user = await Account.findOne({
               where: { google_id: google_id }, include: [
                  {
                     model: AccountInformation
                  }
               ]
            })
            if (!user) {
               const admin_settings = await AdminSettingService.getAdminSetting()
               const data = {
                  google_id: google_id,
                  first_name: _.get(req, "body.user.givenName"),
                  last_name: _.get(req, "body.user.familyName"),
                  email: _.get(req, "body.user.email"),
                  birthday: _.get(req, "body.user_birthday"),
                  avatar_url: _.get(req, "body.user.avatar_url"),
                  limit_money: admin_settings.default_limit_money
               }
               user = await Account.create(data);
               const account_information_data = [
                  {
                     user_id: user.id,
                     type: ACCOUNT_TYPE.BORROWER,
                     balance: 1000000000,
                  },
                  {
                     user_id: user.id,
                     type: ACCOUNT_TYPE.INVESTOR,
                     balance: 1000000000,
                  }
               ]
               await AccountInformation.bulkCreate(account_information_data)
            }
         }
         else {
            user = await Account.findByPk(user_id, {
               include: [
                  {
                     model: AccountInformation
                  }]
            });
            if (!user) {
               throw new Error("user_id not found")
            }
         }

         if (user.status === ACCOUNT_STATUS.BLOCK) {
            throw new Error("your account has banned")
         }

         return user;
      } catch (error) {
         throw new Error(error.message)
      }
   },

   async get_user_by_google_id(google_id) {
      const user = await Account.findOne({
         where: { google_id: google_id }
      })
      if (!user) {
         throw new Error("user_id not found")
      }
      if (user.status === ACCOUNT_STATUS.BLOCK) {
         throw new Error("your account has banned")
      }
      return user
   },

   async update(id, req) {
      try {
         let user = {};
         user = await Account.findByPk(id);
         if (!user) {
            throw new Error("user_id not found")
         }
         if (user.status === ACCOUNT_STATUS.BLOCK) {
            throw new Error("your account has banned")
         }
         const birth_day = new Date(_.get(req, "body.birthday"))
         const data = {
            first_name: _.get(req, "body.first_name"),
            last_name: _.get(req, "body.last_name"),
            birth: birth_day,
            gender: _.get(req, "body.sex"),
            adress: _.get(req, "body.adress")
            // domicile:_.get(req, "body.domicile"),
            // date_issued:_.get(req, "body.date_issued"),
            // permanent_address: _.get(req, "body.permanent_address")
         }
         let phone_number = _.get(req, "body.phone_number")
         if (user.phone_number !== phone_number) {
            const is_exist_phone_number = await Account.findOne({
               where: {
                  phone_number: phone_number
               }
            });
            if (is_exist_phone_number) {
               throw new Error("phone number has exist")
            }
            data.phone_number = phone_number
            data.is_verify_phone = false
         }
         await Account.update(data,
            {
               where: { id: id }
            }
         )

         return "update successful";
      } catch (error) {
         throw new Error(error.message)
      }
   },
   async get_user(id, account_type = 0) {
      try {
         let where = {}
         if (account_type) {
            where.type = account_type
         }
         const user = await Account.findByPk(id, {
            include: [
               {
                  model: AccountInformation,
                  required: true,
               },
            ]
         });
         if (!user) {
            throw new Error("user_id not found")
         }
         if (user.status === ACCOUNT_STATUS.BLOCK) {
            throw new Error("your account has banned")
         }
         return user;
      } catch (error) {
         throw new Error(error.message)
      }
   },
   async get_user_detail(id) {
      try {
         let loan_money = 0
         let invest_money = 0
         let investor_type_money = { "for_business": 0, "for_personal": 0 }
         let borrower_type_money = { "for_business": 0, "for_personal": 0 }
         const user = await Account.findByPk(id, {
            include: [
               {
                  model: AccountInformation,
                  required: true,
               },
               {
                  model: LendingRequest,
                  required: false,
                  where: {
                     status: [LENDING_STATUS.INPROGESS, LENDING_STATUS.DEBT, LENDING_STATUS.LATE_PAYMENT, LENDING_STATUS.WAIT_PAYMENT]
                  },
                  include: [
                     {
                        model: Category
                     }
                  ]
               },
               {
                  model: InvestmentRequest,
                  required: false,
                  where: {
                     status: INVEST_STATUS.CONFIRMED
                  },
                  include: [
                     {
                        model: LendingRequest,
                        include: [
                           {
                              model: Category
                           }
                        ]
                     }
                  ]
               }
            ]
         });
         if (!user) {
            throw new Error("user_id not found")
         }
         if (user.status === ACCOUNT_STATUS.BLOCK) {
            throw new Error("your account has banned")
         }
         for (const borrrow_request of user.lending_requests) {
            loan_money += borrrow_request.total
            if (borrrow_request.categories[0].id === 2) {
               borrower_type_money.for_business += borrrow_request.total
            }
            else {
               borrower_type_money.for_personal += borrrow_request.total
            }
         }
         for (const invest_request of user.investment_requests) {
            invest_money += invest_request.amount
            if (invest_request.lending_requests[0].categories[0].id === 2) {
               investor_type_money.for_business += invest_request.amount
            }
            else {
               investor_type_money.for_personal += invest_request.amount
            }
         }

         return { user, invest_money, loan_money, investor_type_money, borrower_type_money };
      } catch (error) {
         throw new Error("sever error")
      }
   }
};
