//import requires
const express = require('express');
const router = express.Router();
const VerifyAuth = require('../middleware/verify_auth');
const { User } = require("../models/user_model");
const { Admin } = require("../models/admin_model");
const {getAuth} = require("firebase-admin/auth");


module.exports = router.post('/', VerifyAuth(['admin', 'super_admin', 'user'], true), async (request, response) => {
    let id = request.user._id

    //check if id is not empty
    console.log(id)
    if (!id) {
        return response.status(400).send({
            message: "Please provide user id"
        });
    }

    try {
        //get Admin and User from ID
        const CheckUser = await User.findById(id);
        const CheckAdmin = await Admin.findById(id);
        let user = CheckUser || CheckAdmin;
        console.log(user)

        //check if user is not found
        if (!user) {
            return response.status(400).send({
                message: "User not found"
            });
        }

        if(user.userID)
        getAuth()
            .deleteUser(user.userID)
            .then(() => {
                console.log('Successfully deleted user from firebase');
            })
            .catch((error) => {
                console.log('Error deleting user:', error);
            });

        //delete user and send response
        user.remove(
            async (err, user) => {
                if (err) {
                    return response.status(400).send({
                        message: "Error deleting user",
                        error: err.message || "Something went wrong"
                    })
                }
                return response.status(200).send({
                    message: "User deleted successfully",
                    user: user
                })
            }
        )
    }
    catch (e) {
        return response.status(400).send({
            message: "Error deleting user",
            error: e.message || "Something went wrong"
        })
    }
})

