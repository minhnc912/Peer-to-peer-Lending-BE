const _ = require('lodash');
const db = require("../models")
const {LendingCategory, Category, LendingRequest, 
    InvestmentRequest, Account, AccountInformation, AccountHistory} = require("../models");
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;
const sequelize = db.sequelize;
const moment = require('moment');
const AdminSettingService = require('./admin_setting');
const NotificationService = require('./notification');
const { ACCOUNT_STATUS, LENDING_TYPE,LENDING_STATUS,
     INVEST_STATUS, ACCOUNT_TYPE, NOTIFICATION_TYPE,
     TRANSACTION_METHOD, TRANSACTION_TYPE, TRANSACTION_STATUS  
    } = require('../constant');

const mailService = require('./mail')

const CAN_PAYMET = [LENDING_STATUS.DEBT,LENDING_STATUS.LATE_PAYMENT, LENDING_STATUS.WAIT_PAYMENT]
const validate_admin_setting = async (interest_rate, expected_money) => {

    const admin_setting = await AdminSettingService.getAdminSetting()
    if (interest_rate > admin_setting.max_interest_rate) {
        throw new Error("interest rate must be less than ", admin_setting.max_interest_rate)
    }
    if (interest_rate < admin_setting.min_interest_rate) {
        throw new Error("interest rate must be bigger than ", admin_setting.min_interest_rate)
    }
    if (expected_money < admin_setting.min_lending_expected_money) {
        throw new Error("expected money must be bigger than ", admin_setting.min_interest_rate)
    }
}

const handle_start_success_or_cancel = async (borrow_request_ids, type=0) => {
    const borrow_requests = await LendingRequest.findAll({
        where:{
            id: borrow_request_ids
        },
        include:[
            {
                model: InvestmentRequest,
                where:{
                    status: INVEST_STATUS.CONFIRMED
                }
            }
        ]
    })
    if (type == 1){
        for(const borrow_request of borrow_requests){
            await handle_plus_money(borrow_request)
        }
    }
    else if (type == 2){
        for(const borrow_request of borrow_requests){
            await handle_rollback_money(borrow_request)
        }
    }
}

const handle_plus_money = async (borrow_request) => {
    const t = await sequelize.transaction();
    try {
        const account_information = await AccountInformation.findOne({
            where:{
                user_id: borrow_request.user_id,
                type: ACCOUNT_TYPE.BORROWER
            }
        })
         account_information.balance = account_information.balance + borrow_request.total
         await account_information.save({transaction:t})
         let notification_for_investment = []

         for (const invest_request of borrow_request.investment_requests) {
            const invest_request_content = "your invest request id "+ invest_request.id + " has been start"
            const data = {
                user_id : invest_request.user_id,
                type_account : ACCOUNT_TYPE.INVESTOR,
                type_noti : NOTIFICATION_TYPE.INVEST_REQUEST,
                content: invest_request_content,
                invest_id : invest_request.id
            }
            notification_for_investment.push(data)
         }

         const transaction_content = "RECIEVE MONEY from investor"
         const borrow_user = await Account.findByPk(borrow_request.user_id)
         const account_history_data = {
            account_id: account_information.id,
            content: transaction_content,
            amount: borrow_request.total,
            sender_name: "INVESTOR in borrow request id " + borrow_request.id,
            reciever_name: borrow_user.first_name + " " + borrow_user.last_name,
            type:TRANSACTION_TYPE.ADD_MONEY,
            method: TRANSACTION_METHOD.IN_SYSTEM,
            status: TRANSACTION_STATUS.SUCCESS
         }
         await AccountHistory.create(account_history_data, {transaction:t})
         const borrow_request_content = "your borrow request id "+borrow_request.id+" has start successful"
         const account_history_content = "your balance has recieved " + borrow_request.total +" from your borrow request id "+ borrow_request.id
         const notification_for_borrower = [
            {
                user_id : borrow_request.user_id,
                type_account : ACCOUNT_TYPE.BORROWER,
                type_noti : NOTIFICATION_TYPE.BORROW_REQUEST,
                content: borrow_request_content,
                borrow_id : borrow_request.id
            },
            {
                user_id : borrow_request.user_id,
                type_account : ACCOUNT_TYPE.BORROWER,
                type_noti : NOTIFICATION_TYPE.ACCOUNT_HISTORY,
                content: account_history_content,
                borrow_id : borrow_request.id   
            }
         ]
         const notifications = notification_for_investment.concat(notification_for_borrower)
         await NotificationService.bulk_create_notification(notifications, t)
         await t.commit();
    } catch (error) {
        await t.rollback();
        
    }
}

const handle_rollback_money = async (borrow_request, from_payment=false) => {
    const t = await sequelize.transaction();
    try {
        let notification_data = []
        let account_history_data = []
        const borrower_user = await Account.findByPk(borrow_request.user_id)
        const invest_user_ids = borrow_request.investment_requests.map((obj)=>obj.user_id)
        const account_informations = await AccountInformation.findAll({
            where:{
                user_id: invest_user_ids,
                type: ACCOUNT_TYPE.INVESTOR
            }
        })
        let subtract_money = 0
        for(const account_information of account_informations ){
            for(const invest_request of borrow_request.investment_requests){
                if(invest_request.user_id == account_information.user_id){
                    let recieve_money = 0
                    let invest_request_content = ""
                    if (from_payment){
                        recieve_money = invest_request.amount * (1 + borrow_request.interest_rate*(1 - invest_request.discount))
                        subtract_money += invest_request.amount * (1 + borrow_request.interest_rate)
                        invest_request_content = "your invest request id "+invest_request.id+" has been payment"
                    }
                    else {
                        recieve_money = invest_request.amount
                        invest_request_content = "your invest request id "+invest_request.id+" has been cancel"
                    }
                    const account_history_content = "your balance has recieved " + recieve_money +" from your invest request id "+ invest_request.id
                    account_information.balance = account_information.balance + recieve_money
                    await account_information.save({transaction:t})
                    const invest_request_noti = {
                        user_id : invest_request.user_id,
                        type_account : ACCOUNT_TYPE.INVESTOR,
                        type_noti : NOTIFICATION_TYPE.INVEST_REQUEST,
                        content: invest_request_content,
                        invest_id : invest_request.id
                    }
                    const account_history_noti = {
                        user_id : invest_request.user_id,
                        type_account : ACCOUNT_TYPE.INVESTOR,
                        type_noti : NOTIFICATION_TYPE.ACCOUNT_HISTORY,
                        content: account_history_content,
                        invest_id : invest_request.id
                    }
                    const invest_user = await Account.findByPk(invest_request.user_id)
                    const transaction_desc = "RECIEVE from invest request id " +invest_request.id
                    const account_history_for_invest_user = {
                        account_id: account_information.id,
                        content: transaction_desc,
                        amount: invest_request.amount,
                        sender_name: borrower_user.first_name + " " + borrower_user.last_name,
                        reciever_name: invest_user.first_name + " " + invest_user.last_name,
                        type:TRANSACTION_TYPE.ADD_MONEY,
                        method: TRANSACTION_METHOD.IN_SYSTEM,
                        status: TRANSACTION_STATUS.SUCCESS
                    }
                    notification_data.push(invest_request_noti)
                    notification_data.push(account_history_noti)
                    account_history_data.push(account_history_for_invest_user)
                }
            }
        }
        let notification_for_borrower = []

        if ( from_payment){
            const borrower_account_information = await AccountInformation.findOne({
                where:{
                    user_id : borrow_request.user_id,
                    type: ACCOUNT_TYPE.BORROWER
                }
            })
            if (borrower_account_information.balance < subtract_money){
                throw new Error("Insufficient balance in the account")
            }
            borrower_account_information.balance = borrower_account_information.balance - subtract_money
            await borrower_account_information.save({ transaction: t })
            const borrow_request_content = "your borrow_request has been payment successfull"
            const account_history_content = "Your account has been deducted "+ subtract_money + "VND"
            notification_for_borrower = [
                {
                    user_id : borrow_request.user_id,
                    type_account : ACCOUNT_TYPE.BORROWER,
                    type_noti : NOTIFICATION_TYPE.BORROW_REQUEST,
                    content: borrow_request_content,
                    borrow_id : borrow_request.id
                },
                {
                    user_id : borrow_request.user_id,
                    type_account : ACCOUNT_TYPE.BORROWER,
                    type_noti : NOTIFICATION_TYPE.ACCOUNT_HISTORY,
                    content: account_history_content,
                    borrow_id : borrow_request.id   
                }
             ]
             const transaction_desc = "PAYMENT for borrow id " +borrow_request.id
             const account_history_for_borrower_user = {
                account_id: borrower_account_information.id,
                content: transaction_desc,
                amount: subtract_money,
                sender_name: borrower_user.first_name + " " + borrower_user.last_name,
                reciever_name: "INVESTOR from your borrow request id " + borrow_request.id,
                type:TRANSACTION_TYPE.SUB_MONEY,
                method: TRANSACTION_METHOD.IN_SYSTEM,
                status: TRANSACTION_STATUS.SUCCESS
             }
             account_history_data.push(account_history_for_borrower_user)
             borrow_request.status = LENDING_STATUS.FINISH
        }
        else {
            notification_for_borrower = [
                {
                    user_id : borrow_request.user_id,
                    type_account : ACCOUNT_TYPE.BORROWER,
                    type_noti : NOTIFICATION_TYPE.BORROW_REQUEST,
                    content: "your borrow request id " + borrow_request.id + " has been cancel success",
                    borrow_id : borrow_request.id
                },
            ]
            const invest_ids = borrow_request.investment_requests.map((obj)=>obj.id)
            borrow_request.status = LENDING_STATUS.CANCEL
            await InvestmentRequest.update({status:INVEST_STATUS.CANCEL}, {
                where:{
                    id: invest_ids
                }
            })

        }
        borrower_user.limit_money += Math.ceil(borrow_request.expected_money * 0.3)
        await borrower_user.save({transaction:t})
        notification_data = notification_data.concat(notification_for_borrower)
        await NotificationService.bulk_create_notification(notification_data, t)
        await AccountHistory.bulkCreate(account_history_data, {transaction:t})
        await borrow_request.save({transaction:t})
         await t.commit();
    } catch (error) {
        await t.rollback();
        
    }
}


const validate_time = (lending_data) => {
    const start_date = moment(lending_data.start_date, "DD-MM-YYYY");

    const end_date = moment(lending_data.end_date, "DD-MM-YYYY");
    if (! ( start_date.isValid() || end_date.isValid() ) ) {
        throw new Error("start_date or end_date not valid format");
    }
    const now = moment();
    if (start_date.diff(now, 'days') < 0 || end_date.diff(start_date, 'days') < 0) {
        throw new Error("invalid date time");
    }
    if (start_date.diff(now, 'days') > 7) {
        throw new Error("between start_date and created_date not more than 7 days");
    }
    if (end_date.diff(start_date, 'days') > 365) {
        throw new Error("between end_date and start_date not more than 365 days");
    }
    lending_data.start_date = start_date
    lending_data.end_date = end_date
    lending_data.term = end_date.diff(start_date, 'days')
}

const validate_money = (lending_data, user) => {
    if ([LENDING_TYPE.BASIC, LENDING_TYPE.MULTIPLE_MONEY].includes(lending_data.type)) {
        if (!Number.isInteger(lending_data.expected_money)) {
            throw new Error("expected_money must be integer");
        }
    }
    if (lending_data.expected_money > user.limit_money) {
        throw new Error("expected_money must less than ", user.limit_money);
    }
    if (lending_data.minimum_money_for_start > lending_data.expected_money) {
        throw new Error("invalid minumim money for start ")
    }

}
const validate_data = async (lending_data, user) => {
    const category = await Category.findByPk(lending_data.category_id);
    if (!category) {
        throw new Error("invalid category");
    }

    validate_time(lending_data);
    await validate_admin_setting(lending_data.interest_rate, lending_data.expected_money)
    validate_money(lending_data, user.limit_money)
}
module.exports = {
    async create(data, user) {
        try {
            const type_of_lending = _.get(data, "type")

            if (![LENDING_TYPE.BASIC, LENDING_TYPE.MULTIPLE_INVESTER, LENDING_TYPE.MULTIPLE_MONEY].includes(type_of_lending)) {
                throw new Error("invalid type of lending request")
            }

            if(!user.identification){
                throw new Error("User must update identification card first")
            }

            if(!user.identification.img_back || user.identification.img_front){
                throw new Error("User must update full identification card")
            }

            const interest_rate = _.get(data, "interest_rate")
            let lending_request = {}
            let lending_data = {}
            const category_id = _.get(data, "category_id")
            const description = _.get(data, "description")
            const end_date = _.get(data, "end_date")
            const start_date = _.get(data, "start_date")
            const minimum_money_for_start = _.get(data, "minimum_money_for_start")
            lending_data = {
                user_id: user.id, category_id, minimum_money_for_start, description, interest_rate, end_date, type_of_lending, start_date, status: LENDING_STATUS.OPEN
            }
            if (type_of_lending == LENDING_TYPE.BASIC) {
                const expected_money = _.get(data, "expected_money")
                lending_data.expected_money = expected_money
            }
            else if (type_of_lending == LENDING_TYPE.MULTIPLE_INVESTER) {
                const max_number_of_investor = parseInt(_.get(data, "max_number_of_investor"))
                const amount_of_packet = parseFloat(_.get(data, "amount_of_packet"))
                const expected_money = max_number_of_investor * amount_of_packet
                lending_data.expected_money = expected_money
                lending_data.max_number_of_investor = max_number_of_investor
                lending_data.amount_of_packet = amount_of_packet
            }
            else {
                const expected_money = _.get(data, "expected_money")
                const minimum_money = _.get(data, "minimum_money")
                lending_data.expected_money = expected_money
                lending_data.available_money = expected_money
                lending_data.minimum_money = minimum_money
            }
            await validate_data(lending_data, user)
            lending_request = await LendingRequest.create(lending_data)
            await LendingCategory.create({ category_id: category_id, lending_request_id: lending_request.id })
            user.limit_money = user.limit_money - lending_data.expected_money
            await user.save()
            return lending_request
        }
        catch (error) {
            throw new Error(error.message)
        }
    },

    async list(req) {
        const page =  _.get(req, "query.page", 1)
        const limit =  _.get(req, "query.limit", 5)
        const offset = (page -1) * limit
        const contract_term = Number(_.get(req, "query.term", 0))
        const limit_bottom = 10000000
        const limit_top = 50000000
        const user_id = req.user.id
        let where = {}
        where.can_invest = true
        where.user_id = { [Op.not]: user_id}
        if (contract_term > 0 ) {
            where.term = {[Op.lt]: contract_term * 31}
        }
        if ( limit_bottom > 0 && limit_top > 0){
            where.expected_money = {[Op.between]: [limit_bottom, limit_top]}
        }
        else if (limit_bottom > 0) {
            where.expected_money = {[Op.gt]: limit_bottom}
        }
        else if (limit_top > 0) {
            where.expected_money = {[Op.lt]: limit_top}
        }
        try {

            const {count, rows}  = await LendingRequest.findAndCountAll({
                where,
                include: [
                    {
                        model: Category
                    },
                    {
                        model: Account
                    },
                    {
                        model: InvestmentRequest,
                        attributes:["user_id"],
                        required:false,
                        where:{
                            status:INVEST_STATUS.CONFIRMED
                        }
                    }
                ],
                order: [
                    ['id','DESC']
                ],
                offset:offset,
                limit:limit
            });
            return {count, rows};
        } catch (error) {
            throw new Error(error)
        }
    },
    async list_request_user(req, id) {
        try {
            const page =  _.get(req, "query.page", 1)
            const limit =  _.get(req, "query.limit", 5)
            const offset = (page -1) * limit
            const {count, rows}  = await LendingRequest.findAndCountAll({
                where: {
                    user_id : id
                },
                include: [
                    {
                        model: Category
                    },
                    {
                        model: Account
                    },
                    {
                        model: InvestmentRequest,
                        required: false,
                        where:{
                            status:INVEST_STATUS.CONFIRMED
                        }
                    }
                ],
                order: [
                    ['id','DESC']
                ],
                offset:offset,
                limit:limit
            });
            return {count, rows};
        } catch (error) {
            throw new Error(error)
        }
    },
    async getDetail(id) {
        try {
            const Borrow_request = await LendingRequest.findByPk(id, {
                include: [
                    {
                        model: InvestmentRequest,
                        required: false,
                        where:{
                            status:INVEST_STATUS.CONFIRMED
                        }
                    },
                    {
                        model: Account,
                        where:{
                            status:ACCOUNT_STATUS.LIVE
                        }
                    }
                ]
            })
            if (!Borrow_request) {
                throw new Error("invalid borrow request")
             }
            return Borrow_request;
        } catch (error) {
            throw new Error(error)
        }
    },
    async handle_start_request() {
        try {
            const CurrentDate = moment().format('YYYY-MM-DD');

            const lending_requests_to_start = await LendingRequest.update({
                can_invest: false, status: LENDING_STATUS.INPROGESS
            }, {
                where: {
                    total: {
                        [Op.gte]: sequelize.col('minimum_money_for_start')
                    },
                    $and: sequelize.where(sequelize.fn('to_char', sequelize.col('start_date'), 'YYYY-MM-DD'), Op.eq, CurrentDate)
                },
                returning: true,

            })
            const lending_id_for_start = lending_requests_to_start.map((obj) => obj.id)
            await handle_start_success_or_cancel(lending_id_for_start, 1)
            const lending_requests_to_cancel = await LendingRequest.update({
                can_invest: false, status: LENDING_STATUS.CANCEL
            }, {
                where: {
                    total: {
                        [Op.or]: {
                            [Op.lt]: sequelize.col('minimum_money_for_start'),
                            [Op.eq]: 0
                        }
                    },
                    $and: sequelize.where(sequelize.fn('to_char', sequelize.col('start_date'), 'YYYY-MM-DD'), Op.eq, CurrentDate),
                },
                returning: true,
            })
            const lending_id_for_cancel = lending_requests_to_cancel.map((obj) => obj.id)
            handle_start_success_or_cancel(lending_id_for_cancel, 2)
            return "done";
        } catch (error) {
            throw new Error(error)
        }
    },
    async handle_end_request() {
        const now = moment();

        // handle wait to payment
        const CurrentDate = now.format('YYYY-MM-DD');
        let user_id_to_lock_account = []
        let user_id_to_ban_account = []
        const lending_requests_to_payment = await LendingRequest.update({
            status: LENDING_STATUS.WAIT_PAYMENT
        }, {
            where: {
                status: LENDING_STATUS.INPROGESS,
                $and: sequelize.where(sequelize.fn('to_char', sequelize.col('end_date'), 'YYYY-MM-DD'), Op.eq, CurrentDate)
            },
            returning: true,

        })

        const user_ids_to_payment = lending_requests_to_payment.map((obj) => obj.id)
        const users = await Account.findAll({
            where:{
                id:user_ids_to_payment
            }
        })

        const subject = "Pay for your loan"
        const mail_promise = []
        for(const user of users){
            for (const item of lending_requests_to_payment){
                if (item.user_id == user.id){
                    content ="your borrow request id "+ item.id +" needs to payment within 3 day next"
                    mail_promise.push(mailService.send_mail(subject=subject,to=user.email, content =content))
                }
                
            }
        }
        await Promise.all(mail_promise)

        // handle late to payment
        const late_payment_date = now.subtract(4, 'days').format('YYYY-MM-DD');
        const lending_request_to_late_payment = await LendingRequest.update({
            status: LENDING_STATUS.LATE_PAYMENT
        }, {
            where: {
                status: LENDING_STATUS.WAIT_PAYMENT,
                $and: sequelize.where(sequelize.fn('to_char', sequelize.col('end_date'), 'YYYY-MM-DD'), Op.eq, late_payment_date)
            },
            returning: true,

        })

        lending_request_to_late_payment.forEach(element => {
            user_id_to_lock_account.push(element.user_id)
        });

        const account_to_lock = await Account.findAll({
            where: {
                id: user_id_to_lock_account
            }
        })

        const promises = account_to_lock.map(async function(account){
            return await Account.update({
                credit_score:account.credit_score - 10, status:ACCOUNT_STATUS.LOCK
            },{
                where:{
                    id : account.id
                }
            });
        });

        Promise.all(promises)

        // handle debt to payment
        const debt_payment_date = now.subtract(10, 'days').format('YYYY-MM-DD');
        const lending_request_to_debt = await LendingRequest.update({
            status: LENDING_STATUS.DEBT
        }, {
            where: {
                status: LENDING_STATUS.LATE_PAYMENT,
                $and: sequelize.where(sequelize.fn('to_char', sequelize.col('end_date'), 'YYYY-MM-DD'), Op.eq, debt_payment_date)
            },
            returning: true,

        })

        lending_request_to_debt.forEach(element => {
            user_id_to_ban_account.push(element.user_id)
        });

        await Account.update({ status: LENDING_STATUS.DEBT }, {
            where: {
                id: user_id_to_ban_account
            }
        })


        return lending_request_to_debt

    },

    async cancel_request (id) {
       try {
        const borrow_request = await this.getDetail(id)
        if (borrow_request.status != LENDING_STATUS.OPEN){
            throw new Error("you can't cancel request");
        }
        await handle_rollback_money(borrow_request)
        borrow_request.status = LENDING_STATUS.CANCEL
        await borrow_request.save()
        return borrow_request
       } catch (error) {
        throw new Error(error.message);
       }
    },

    async start_request (id) {
        try {
         const borrow_request = await this.getDetail(id)
         if (borrow_request.status != LENDING_STATUS.OPEN){
             throw new Error("you can't start request");
         }
         if (borrow_request.total <= borrow_request.minimum_money_for_start ){
            throw new Error("not enough money for start");
         }
         await handle_plus_money(borrow_request)
         const now = moment();
         const end_date = moment(borrow_request.end_date, "DD-MM-YYYY");
         const early_start = moment(borrow_request.start_date, "DD-MM-YYYY").fromNow();
         if (early_start !== 0){
            borrow_request.end_date = end_date.subtract(early_start, "days")
         }
         borrow_request.start_date = now
         borrow_request.status = LENDING_STATUS.INPROGESS
         await borrow_request.save()
         return borrow_request
        } catch (error) {
         throw new Error(error.message);
        }
     },
    async pre_for_payment (id){
        try {
        const borrow_request = await this.getDetail(id)
        if (!CAN_PAYMET.includes(borrow_request.status)){
            throw new Error("you can't payment your borrow request now")
        }
        const account_information = await AccountInformation.findOne({
            where:{
                user_id : borrow_request.user_id,
                type: ACCOUNT_TYPE.BORROWER
            }
        })
        if ( account_information.balance < borrow_request.total_payment ){
            throw new Error("Insufficient balance in the account")
        }
        return "can payment now"
        } catch (error) {
            throw new Error(error.message);
        }
    },
    async payment (id) {
        try {
            const borrow_request = await this.getDetail(id)
            if (!CAN_PAYMET.includes(borrow_request.status)){
                throw new Error("you can't payment your borrow request now")
            }
            await handle_rollback_money(borrow_request, from_payment=true)
        } catch (error) {
            throw new Error(error.message);
        }
    }
};
