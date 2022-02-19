//import all necessary files
const express = require('express');
const router = express.Router();
const {Admin} = require('../models/admin_model');
const verifyAuth = require('../middleware/verify_auth');

module.exports = router.post('/', verifyAuth(["super_admin"], true), (req, res) => {
    //get the email from the request body
    const { email } = req.body;

    //validate email
    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    Admin.deleteOne({email: email}, (err, admin) => {
        if (err) {
            return res.status(500).json({
                message: "Error deleting user"
            });
        }
        console.log(user);
        if(user.deletedCount == 1){
            return res.status(200).json({
                message: "Admin deleted successfully"
            });
        }
        else{
            return res.status(404).json({
                message: "Admin not found"
            });
        }
    });
})


