//import all necessary files
const express = require('express');
const router = express.Router();
const verifyAuth = require('../middleware/verify_auth');
const {User} = require("../models/user_model");

module.exports = router.post('/', verifyAuth(["super_admin", "admin"], true), (req, res) => {
    //get the email from the request body
    const { email } = req.body;

    //validate email
    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    const userToDelete = User.findOne({email: email})

    if(!userToDelete){
        return res.status(400).send({
            message: "User not found"
        })
    }

    //admin can only delete user
    if(req.user.role === "admin"){
        if(["super_admin", "admin"].includes(userToDelete.role)){
            return res.status(400).send({
                message: "You are attempting to delete an admin, you are not authorised to perform this action"
            })
        }
    }
    //super admin cannot delete super admin
    else if(req.user.role === "super_admin"){
        if(userToDelete.role === "super_admin"){
            return res.status(400).send({
                message: "You are attempting to delete a super admin, you are not authorised to perform this action"
            })
        }
    }


    userToDelete.remove(
        async (err, user) => {
            if (err) {
                return res.status(400).send({
                    message: "Error deleting admin",
                    error: err.message || "Something went wrong"
                })
            }
            return res.status(200).send({
                message: "Admin deleted successfully",
                user: user
            })
        }
    )

})


