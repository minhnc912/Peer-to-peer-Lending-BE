require('dotenv').config()
const _ = require('lodash');
const Utils = require('../sharing/Utils')
const { Identification, Account } = require("../models");
const AuthenticationService = require('./authentication')
const awsSNS = require('./aws_sns')
const moment = require('moment');

module.exports = {
    async update_identification(req) {
     try {
        const user_id = req.user.id
        const identification_id = _.get(req, "body.id")
        const name = _.get(req, "body.name")
        const birth = moment(_.get(req, "body.dob"), "DD/MM/YYYY");
        const home = _.get(req, "body.home")
        const address = _.get(req, "body.address")
        const type = _.get(req, "body.type_new")
        const id_prob = parseFloat(_.get(req, "body.id_prob"))
        const name_prob = parseFloat(_.get(req, "body.name_prob"))
        const dob_prob = parseFloat(_.get(req, "body.dob_prob"))
        const home_prob = parseFloat(_.get(req, "body.home_prob"))
        const address_prob = parseFloat(_.get(req, "body.address_prob"))

        const score = (id_prob + name_prob + dob_prob + home_prob + address_prob)/5
        const data = {
            identification_id, name, birth, home, address, user_id, score, type
        }
        await Identification.destroy({where:{
            user_id
        }})
        await Identification.create(data)
        await Account.update({
            credit_score:score
        },{
            where:{
                id:user_id
            }
        })
        const user = await Account.findByPk(user_id, {
            include: [
                {
                    model: Identification
                }
            ]
        })
        return user
     } catch (error) {
        throw new Error(error)
     }
    },
 };
 
