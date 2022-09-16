require('dotenv').config()
const Sequelize = require("sequelize");

// const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST,
//   dialect: 'postgres',
//   operatorsAliases: 0,

//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000
//   }
// });

const sequelize = new Sequelize("p2plending", "postgres", "p2plendingdb", {
  host: "p2plendingdb.cmn7rrtkragc.ap-southeast-1.rds.amazonaws.com",
  dialect: 'postgres',
  operatorsAliases: 0,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


const Account = require("./accounts")(sequelize, Sequelize);
const AccountHistory = require("./account_hisory")(sequelize, Sequelize);
const AccountInformation = require("./account_information")(sequelize, Sequelize);
const Identification = require("./identification")(sequelize, Sequelize);
const CardInformation = require("./card_information")(sequelize, Sequelize);
const LendingRequest = require("./lending_request")(sequelize, Sequelize);
const InvestmentRequest = require("./investment_request")(sequelize, Sequelize);
const InvestmentLendingRequest = require("./investment_lending_request")(sequelize, Sequelize);
const Category = require("./category")(sequelize, Sequelize);
const LendingCategory = require("./lending_category")(sequelize, Sequelize);
const Notification = require("./notification")(sequelize, Sequelize);
const NotificationToken = require("./notification")(sequelize, Sequelize);
const AdminSetting = require("./admin_setting")(sequelize, Sequelize);
const AccountOTP = require("./account_otp")(sequelize, Sequelize);
const AccountPayment = require("./account_payment")(sequelize, Sequelize);
// Account
Account.hasMany(AccountInformation,{ foreignKey: 'user_id' })
Account.hasMany(LendingRequest,{ foreignKey: 'user_id' })
Account.hasMany(InvestmentRequest,{ foreignKey: 'user_id' })

// AccountHistory
AccountHistory.belongsTo(AccountInformation, {foreignKey: "account_id"});

// AccountInformation
AccountInformation.belongsTo(Account, {
  foreignKey: 'user_id'
});
AccountInformation.hasOne(CardInformation, {
  foreignKey: 'card_id'
})
AccountInformation.hasMany(AccountHistory,{ foreignKey: 'account_id' })

// Identification
Identification.belongsTo(Account, {
  foreignKey: 'user_id'
});

// CardInformation
CardInformation.belongsTo(AccountInformation, {
  foreignKey: 'card_id'
});

// LendingRequest
LendingRequest.belongsTo(Account, {
  foreignKey: 'user_id'
});
LendingRequest.belongsToMany(Category, { through: LendingCategory });
LendingRequest.belongsToMany(InvestmentRequest, {through: InvestmentLendingRequest});

// InvestmentRequest
InvestmentRequest.belongsTo(Account, {
  foreignKey: 'user_id'
});
InvestmentRequest.belongsToMany(LendingRequest, {through: InvestmentLendingRequest});
// Category
Category.belongsToMany(LendingRequest, {through: LendingCategory });

// LendingCategory

// Notification
Notification.belongsTo(Account, {
  foreignKey: 'user_id'
});

// NotificationToken
NotificationToken.belongsTo(Account, {
  foreignKey: 'user_id'
});


db.Account = Account
db.AccountHistory = AccountHistory
db.AccountInformation = AccountInformation
db.Identification = Identification
db.LendingRequest = LendingRequest
db.InvestmentRequest = InvestmentRequest
db.InvestmentLendingRequest = InvestmentLendingRequest
db.Category = Category
db.LendingCategory = LendingCategory
db.Notification = Notification
db.NotificationToken = NotificationToken
db.AdminSetting = AdminSetting
db.AccountOTP = AccountOTP
db.AccountPayment = AccountPayment
module.exports = db