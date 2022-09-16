
module.exports = {
  randomOTPCode() {
    try {
       return Math.floor(1000 + Math.random() * 9000);
    } catch (error) {
      res.status(400).send(error.message)
    }
  },

  randomId() {
    try {
       return Math.floor(1000000 + Math.random() * 9000000);
    } catch (error) {
      res.status(400).send(error.message)
    }
  },

};