const BorrowRequestService = require('../service/borrow_request')
const AuthenticationService = require('../service/authentication')
module.exports = {
   async create(req, res) {
      try {
         const user_id = req.user.id
         const user = await AuthenticationService.get_user(user_id)
         const borow_request = await BorrowRequestService.create(req.body, user)
         res.status(200).send(borow_request)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

   async list(req, res) {
      try {
         const data = await BorrowRequestService.list(req)
         res.status(200).send(data)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

   async list_your_borrow_request(req, res) {
      try {
         const id = req.user.id
         if (!id) {
            res.status(400).send("user_id must required")
         }
         await AuthenticationService.get_user(id)
         const data = await BorrowRequestService.list_request_user(req, id)
         res.status(200).send(data)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

   async getDetail(req, res) {
      try { 
         const id = req.params['id']
         if (!id) {
            res.status(400).send("id must required")
         }
         const borow_request = await BorrowRequestService.getDetail(id)
         res.status(200).send(borow_request)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

   async pre_for_payment(req, res) {
      try {
         const id = req.params['id']
         if (!id) {
            res.status(400).send("id must required")
         }
         const message = await BorrowRequestService.pre_for_payment(id)
         res.status(200).send(message)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

   async payment(req, res) {
      try {
         const id = req.params['id']
         if (!id) {
            res.status(400).send("id must required")
         }
         const response = await BorrowRequestService.payment(id)
         res.status(200).send(response)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

   async cancel(req, res) {
      try {
         const id = req.params['id']
         if (!id) {
            res.status(400).send("id must required")
         }
         const response = await BorrowRequestService.cancel_request(id)
         res.status(200).send(response)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

   async start_now(req, res) {
      try {
         const id = req.params['id']
         if (!id) {
            res.status(400).send("id must required")
         }
         const response = await BorrowRequestService.start_request(id)
         res.status(200).send(response)
      } catch (error) {
         res.status(400).send(error.message)
      }
   },

};