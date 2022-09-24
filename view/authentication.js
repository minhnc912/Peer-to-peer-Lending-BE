const AuthenticationService = require('../service/authentication')
const IdentificationService = require('../service/identification')
const firebaseService = require("../service/firebase")
const awsService = require("../service/upload_s3")
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

async update_identification(req, res) {
   try {
   const id = req.user.id 
   if (!id) {
      throw new Error("user_id  must required")
   }
   const response = await IdentificationService.update_identification(req)
   res.status(200).send(response)
   } catch (error) {
    res.status(400).send(error.message)
   }
},

async get_signed_url(req, res) {
   const id = req.user.id 
   if (!id) {
      throw new Error("user_id  must required")
   }
   const response =  await awsService.get_upload_url(req)
   res.status(200).send(response)
},

async get_post_url(req, res) {
   const id = req.user.id 
   if (!id) {
      throw new Error("user_id  must required")
   }
   const url =  await awsService.get_post(req)
   res.status(200).send(url)
},

async get_dowload_url(req, res) {
   const id = req.user.id 
   if (!id) {
      throw new Error("user_id  must required")
   }
   const response =  await awsService.get_dowload_url(req)
   res.status(200).send(response)
}

};