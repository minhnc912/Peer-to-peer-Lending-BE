const AuthenticationService = require('../service/authentication')
const firebaseService = require("../service/firebase")
module.exports = {
   async login(req, res) {
     try {
      // let user = await firebaseService.login(req.body.user)
     let user = await AuthenticationService.login(req)
     res.status(200).send(user)
     } catch (error) {
      res.status(400).send(error.message)
     }
  },
  async update_information(req, res) {
    try {
    const id = req.user.id      
    if (!id) {
       throw new Error("user_id  must required")
    }
    const message = await AuthenticationService.update(id, req)
    res.status(200).send(message)
    } catch (error) {
     res.status(400).send(error.message)
    }
 },
 async get_user_detail(req, res) {
   try {
   const id = req.user.id       
   if (!id) {
      throw new Error("user_id  must required")
   }
   const response = await AuthenticationService.get_user_detail(id)
   res.status(200).send(response)
   } catch (error) {
    res.status(400).send(error.message)
   }
},
};