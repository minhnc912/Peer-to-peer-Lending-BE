const NotificationService = require('../service/notification.js')
module.exports = {
  async list(req, res) {
    try {
      const user_id = req.query.user_id
      const type_account = req.query.type_account
      const notifications = await NotificationService.get_notification(user_id, type_account)
      res.status(200).send(notifications)
    } catch (error) {
      res.status(400).send(error.message)
    }
  },

  async mark_has_read(req, res) {
    try {
        const alert_id = req.body.alert_id
       const message = await NotificationService.mark_read(alert_id)
       res.status(200).send(message)
    } catch (error) {
       res.status(400).send(error.message)
    }
 },
};