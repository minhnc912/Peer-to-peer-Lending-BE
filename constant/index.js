const { LENDING_TYPE, LENDING_STATUS } = require("./lending_request");
const { INVEST_STATUS } = require("./invest_request");
const { ADMIN_SETTING_TYPE } = require("./admin_setting");
const {ACCOUNT_STATUS,ACCOUNT_TYPE} = require("./account");
const {NOTIFICATION_TYPE} = require("./notification")
const {TRANSACTION_STATUS, TRANSACTION_TYPE, TRANSACTION_METHOD} = require("./account_history")

module.exports.ACCOUNT_STATUS = ACCOUNT_STATUS;
module.exports.ACCOUNT_TYPE = ACCOUNT_TYPE;
module.exports.LENDING_TYPE = LENDING_TYPE;
module.exports.LENDING_STATUS = LENDING_STATUS;
module.exports.INVEST_STATUS = INVEST_STATUS;
module.exports.ADMIN_SETTING_TYPE = ADMIN_SETTING_TYPE;
module.exports.NOTIFICATION_TYPE = NOTIFICATION_TYPE;
module.exports.TRANSACTION_STATUS = TRANSACTION_STATUS;
module.exports.TRANSACTION_TYPE = TRANSACTION_TYPE;
module.exports.TRANSACTION_METHOD = TRANSACTION_METHOD;
