//import files
const express = require('express');
const router = express.Router();
const { User } = require('../models/user_model');
const verifyAuth = require('../middleware/verify_auth');

//get list of all users and admins if admin or super admin in route
router.post('/', verifyAuth(["super_admin", "admin"], true), (req, res) => {

    //get user type in body
    const { userType } = req.body;

    if(!userType){
        return res.status(400).send({
            message: "Please attach user type"
        })
    }

    if(!['user', 'admin', 'super_admin'].includes(userType)){
        return res.status(400).send({
            message: "Please attach a valid user type"
        })
    }

    User.find({role: userType}, (err, users) => {
        if (err) {
            return res.status(500).json({
                message: "Error getting users"
            });
        }

        if (!users) {
            return res.status(404).json({
                message: `Users of type ${userType} not found`
            });
        }
        return res.status(200).json({
            message: `Users of type ${userType} fetched successfully`,
            users: users
        });
    });

    
});

module.exports = router;

