//Login route for the application

//importing the required modules
const bcrypt = require('bcrypt');
const express = require("express");
const router = express.Router();
const { User } = require("../models/user_model");

//login route
module.exports = router.post("/", (req, res) => {
    const { phoneNumber } = req.body;
    const { password } = req.body;

    //check if phone number is valid
    if (!phoneNumber) {
        return res.status(400).json({
            message: "Phone number is required"
        });
    }

    //check if password is valid
    if (!password) {
        return res.status(400).json({
            message: "Password is required"
        });
    }

    //Check if user exists in mongoose
    User.findOne({ phoneNumber: phoneNumber }, (err, user) => {
        if (err) {
            return res.status(500).json({
                message: "Internal server error"
            });
        }

        //check if user exists
        if (!user) {
            return res.status(400).json({
                message: "User does not exist"
            });
        }

        //compare bcrypt password
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }


            //if everything is valid, create JWT from user schema and send back to user
            return res.status(200).json({
                message: "Login successful",
                token: user.generateAuthToken()
            });

    }
    );
});