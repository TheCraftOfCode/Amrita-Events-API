//all necesary imports
const express = require('express');
const router = express.Router();
const {User} = require('../models/user_model');
const verifyAuth = require('../middleware/verify_auth');

module.exports = router.post('/', verifyAuth(["super_admin", "admin"], true), (req, res) => {
    //get phone number from the request body
    const { phoneNumber } = req.body;

    //validate phone number and delete user
    if (!phoneNumber) {
        return res.status(400).json({
            message: "Phone number is required"
        });
    }
    
    User.deleteOne({phoneNumber: phoneNumber}, (err, user) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting user"
            });
        }
        console.log(user);
        if(user.deletedCount == 1){
            return res.status(200).json({
                message: "User deleted successfully"
            });
        }
        else{
            return res.status(404).json({
                message: "User not found"
            });
        }
    }
    );
});
     

