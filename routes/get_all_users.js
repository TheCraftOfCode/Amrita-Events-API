//import files
const express = require('express');
const router = express.Router();
const { User } = require('../models/user_model');
const { Admin } = require('../models/admin_model');
const verifyAuth = require('../middleware/verify_auth');

//get list of all users and admins if admin or super admin in route
router.post('/', verifyAuth(["super_admin", "admin"], true), (req, res) => {

    //get user type in body
    const { userType } = req.body;
    if (userType === "user") {
        User.find({}, (err, users) => {
            if (err) {
                return res.status(500).json({
                    message: "Error getting users"
                });
            }

            if (!users) {
                return res.status(404).json({
                    message: "Users not found"
                });
            }

            return res.status(200).json({
                message: "Users fetched successfully",
                users: users
            });
        });
    }
    else if (userType === "admin") {
        Admin.find({}, (err, admins) => {
            if (err) {
                return res.status(500).json({
                    message: "Error getting admins"
                });
            }

            if (!admins) {
                return res.status(404).json({
                    message: "Admins not found"
                });
            }

            return res.status(200).json({
                message: "Admins fetched successfully",
                admins: admins
            });
        });
    }
    else {
        User.find({}, (err, users) => {
            if (err) {
                return res.status(500).json({
                    message: "Error getting users"
                });
            }

            if (!users) {
                return res.status(404).json({
                    message: "Users not found"
                });
            }

            Admin.find({}, (err, admins) => {
                if (err) {
                    return res.status(500).json({
                        message: "Error getting admins"
                    });
                }

                if (!admins) {
                    return res.status(404).json({
                        message: "Admins not found"
                    });
                }

                return res.status(200).json({
                    message: "Users and admins fetched successfully",
                    users: users,
                    admins: admins
                });
            });
        });
    }
    
});

module.exports = router;

