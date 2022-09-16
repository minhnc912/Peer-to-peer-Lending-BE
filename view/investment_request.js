
const AuthenticationService = require('../service/authentication')
const InvestmentRequestService = require('../service/investment_request')
const ACCOUNT_TYPE = require('../constant').ACCOUNT_TYPE
module.exports = {
  async create(req, res) {
    try {
      const user_id = req.user.id
      const user = await AuthenticationService.get_user(user_id, ACCOUNT_TYPE.INVESTOR)
      const response = await InvestmentRequestService.create(req.body, user)
      res.status(200).send(response)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },

  async getDetail(req, res) {
    try {
       const id = req.params['id']
       const invest_request = await InvestmentRequestService.getDetail(id)
       res.status(200).send(invest_request)
    } catch (error) {
       res.status(400).send(error.message)
    }
 },

};