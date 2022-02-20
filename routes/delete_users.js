//all necesary imports
const express = require('express');
const router = express.Router();
const { User } = require('../models/user_model');
const verifyAuth = require('../middleware/verify_auth');
const { getAuth } = require("firebase-admin/auth");

module.exports = router.post('/', verifyAuth(["super_admin", "admin"], true), (req, res) => {
    //get phone number from the request body
    const { phoneNumber } = req.body;

    //validate phone number and delete user
    if (!phoneNumber) {
        return res.status(400).json({
            message: "Phone number is required"
        });
    }

    //get user by phone number
    User.findOne({ phoneNumber: phoneNumber }, (err, user) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting user"
            });
        }
        if (user) {
            if (user.userID)
                getAuth()
                    .deleteUser(user.userID)
                    .then(() => {
                        console.log('Successfully deleted user from firebase');
                    })
                    .catch((error) => {
                        console.log('Error deleting user:', error);
                    });
            user.remove(
                (err, user) => {
                    if (err) {
                        return res.status(400).json({
                            message: "Error deleting user",
                            error: err.message || "Something went wrong"
                        });
                    }
                    return res.status(200).json({
                        message: "User deleted successfully",
                        user: user
                    });
                }
            )
        } else {
            return res.status(404).json({
                message: "User not found"
            });
        }
    });
});


