const TRANSACTION_STATUS = {
    SUCCESS:1,
    FAIL:0,	
}

const TRANSACTION_TYPE = {
    ADD_MONEY: 1,
    SUB_MONEY: 2,
    RECHANGE:3,
    WIDTHDRAW:4
}

const TRANSACTION_METHOD = {
    IN_SYSTEM: 1,
    OUT_SYSTEM: 2,
}

module.exports.TRANSACTION_STATUS = TRANSACTION_STATUS;
module.exports.TRANSACTION_TYPE = TRANSACTION_TYPE;
module.exports.TRANSACTION_METHOD = TRANSACTION_METHOD;