const _ = require('lodash');
const db = require("../models");
const { Account, InvestmentRequest,
   InvestmentLendingRequest, AccountInformation,
   AccountHistory, LendingRequest } = require("../models");
const sequelize = db.sequelize;
const {
   INVEST_STATUS, LENDING_TYPE,
   LENDING_STATUS, NOTIFICATION_TYPE,
   ACCOUNT_TYPE, TRANSACTION_METHOD, TRANSACTION_STATUS, TRANSACTION_TYPE
} = require('../constant')
const AdminSettingService = require('./admin_setting')
const BorrowRequestService = require('./borrow_request')
const AuthenticationService = require('./authentication')
const NotificationService = require('./notification');
const OTPService = require('./otp');


const validate_invest_request = (Borrow_request, invest_request) => {
   if (!Borrow_request.can_invest) {
      throw new Error("you can't invest this request")
   }
   if (Borrow_request.type_of_lending == LENDING_TYPE.BASIC) {
      if (invest_request.amount != Borrow_request.expected_money) {
         throw new Error("invalid amount")
      }
   }
   if (Borrow_request.type_of_lending == LENDING_TYPE.MULTIPLE_INVESTER) {
      if (invest_request.amount != Borrow_request.amount_of_packet) {
         throw new Error("invalid amount")
      }
   }
   if (Borrow_request.type_of_lending == LENDING_TYPE.MULTIPLE_MONEY) {
      if (invest_request.amount < Borrow_request.minimum_money) {
         if (invest_request != Borrow_request.available_money) {
            throw new Error("invalid amount")
         }
      }
      if (invest_request.amount > Borrow_request.available_money) {
         throw new Error("invalid amount")
      }
   }
}

const findById = async (id) => {
   const invest_request = await InvestmentRequest.findByPk(id, {
      include: [
         {
            model: LendingRequest
         },
         {
            model: Account
         }
      ]
   })
   return invest_request
}

const handle_after_create_success = async (user, Borrow_request, invest_request, account_information, min_invest_money, t) => {
   if (Borrow_request.type_of_lending == LENDING_TYPE.BASIC) {
      Borrow_request.total = invest_request.amount
      Borrow_request.can_invest = false
      Borrow_request.status = LENDING_STATUS.INPROGESS
   }
   if (Borrow_request.type_of_lending == LENDING_TYPE.MULTIPLE_INVESTER) {
      Borrow_request.number_of_investor += 1
      if (Borrow_request.number_of_investor == Borrow_request.max_number_of_investor) {
         Borrow_request.can_invest = false
      }
      Borrow_request.total = Borrow_request.number_of_investor * Borrow_request.amount_of_packet
   }
   if (Borrow_request.type_of_lending == LENDING_TYPE.MULTIPLE_MONEY) {
      Borrow_request.total += invest_request.amount
      Borrow_request.available_money = Borrow_request.expected_money - Borrow_request.total
      if (Borrow_request.available_money <= min_invest_money) {
         Borrow_request.can_invest = false
      }
   }
   let total_payment_raw = Borrow_request.total * (1 + Borrow_request.interest_rate)
   let total_payment_after = Math.round(total_payment_raw);
   if (total_payment_raw > total_payment_after) {
      total_payment_after +=1
   }
   Borrow_request.total_payment =  total_payment_after
   const transaction_desc = "INVEST for borrow request id " + Borrow_request.id
   const borrow_user = await AuthenticationService.get_user(Borrow_request.user_id, account_type=1)
   const account_history_data = {
      account_id: account_information.id,
      content: transaction_desc,
      amount: invest_request.amount,
      sender_name: user.first_name + " " + user.last_name,
      reciever_name: borrow_user.first_name + " " + borrow_user.last_name,
      type: TRANSACTION_TYPE.SUB_MONEY,
      method: TRANSACTION_METHOD.IN_SYSTEM,
      status: TRANSACTION_STATUS.SUCCESS
   }
   await AccountHistory.create(account_history_data, { transaction: t })
   const new_balance = account_information.balance - invest_request.amount
   await AccountInformation.update({
      balance: new_balance
   },
      {
         where: {
            id: account_information.id
         }
      },
      { transaction: t })
   if (Borrow_request.type_of_lending == LENDING_TYPE.BASIC){
      await AccountInformation.update({
         balance: borrow_user.account_informations[0].balance + invest_request.amount
      },
         {
            where: {
               id: borrow_user.account_informations[0].id
            }
         },
         { transaction: t })
   }
   await Borrow_request.save({ transaction: t })
   const content = "your invest id " + invest_request.id + " has verify successful"
   await NotificationService.create_notification(user.id, NOTIFICATION_TYPE.INVEST_REQUEST, ACCOUNT_TYPE.INVESTOR, content, invest_request.id, 0)
}

module.exports = {
   async create(data, user) {
      const t = await sequelize.transaction();
      try {
         let invest_request = {}
         const amount_of_money = _.get(data, "amount_of_money")
         const borrow_request_id = _.get(data, "borrow_request_id")
         const adminSettings = await AdminSettingService.getAdminSetting()

         if (amount_of_money < adminSettings.min_invest_money) {
            throw new Error("invest money must bigger than " + adminSettings.min_invest_money)
         }
         if (amount_of_money > _.get(user, "account_informations[0].balance")) {
            throw new Error("Insufficient account balance")
         }

         if (!_.get(user, "is_verify_phone")) {
            throw new Error("You must verify your phone number")
         }

         let Borrow_request = await BorrowRequestService.getDetail(borrow_request_id)
         if (Borrow_request.account.id === user.id) {
            throw new Error("you can't invest your borrow request")
         }
         for (const invest_request of Borrow_request.investment_requests) {
            if (invest_request.user_id == user.id) {
               throw new Error("you can't invest this request")
            }
         }
         let invest_request_data = { user_id: parseInt(user.id), amount: amount_of_money, discount: adminSettings.discount_rate, status: INVEST_STATUS.DRAFT }
         validate_invest_request(Borrow_request, invest_request_data)

         const actually_recieved = amount_of_money + ((amount_of_money * Borrow_request.interest_rate) * (1 - parseFloat(adminSettings.discount_rate)))
         invest_request_data.actually_recieved = actually_recieved

         invest_request = await InvestmentRequest.create(invest_request_data, { transaction: t })
         await InvestmentLendingRequest.create({ lending_request_id: Borrow_request.id, investment_request_id: invest_request.id }, { transaction: t })
         await t.commit();
         invest_request = await findById(invest_request.id)
         const invest_otp_id = await OTPService.verify_investment_request(invest_id = invest_request.id, user_id = user.id)
         return { invest_request: invest_request, otp_id: invest_otp_id }
      } catch (error) {
         await t.rollback();
         throw new Error(error)
      }
   },

   async getDetail(id) {
      const invest_request = await findById(id, {
         where:{
            status: [INVEST_STATUS.CONFIRMED, INVEST_STATUS.CANCEL]
         },
         include: [
            {
               model: LendingRequest,
               required: true
            }
         ]
      })
      if (!invest_request) {
         throw new Error("not found invest request")
      }
      return invest_request

   },
   async handleAfterConfirmer(invest_id) {
      const t = await sequelize.transaction();
      try {
         const invest_request = await findById(invest_id)
         invest_request.status = INVEST_STATUS.CONFIRMED
         const user = await AuthenticationService.get_user(invest_request.user_id, account_type = 2)
         const adminSettings = AdminSettingService.getAdminSetting()
         await handle_after_create_success(user, invest_request.lending_requests[0], invest_request, user.account_informations[0], adminSettings.min_invest_money, t)
         await invest_request.save({transaction:t})
         await t.commit();
         if (!invest_request) {
            throw new Error("not found invest request")
         }
      } catch (error) {
         await t.rollback();
         throw new Error(error)
      }

   }
};
