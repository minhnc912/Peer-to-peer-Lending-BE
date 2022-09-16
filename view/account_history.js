const AccountHistoryService = require('../service/account_history.js')
module.exports = {
  async list(req, res) {
    try {
      const response = await AccountHistoryService.get_list_account_history(req)
      res.status(200).send(response)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },
};