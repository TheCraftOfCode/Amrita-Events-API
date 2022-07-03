//admin login route
//import the required modules
const bcrypt = require('bcrypt');
const express = require("express");
const {User} = require("../models/user_model");
const router = express.Router();
//import verify auth
//add login route
module.exports = router.post("/", (req, res) => {

    //get the email and password from the request body
    const { email } = req.body;
    const { password } = req.body;

    //check if email is valid
    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    //check if password is valid
    if (!password) {
        return res.status(400).json({
            message: "Password is required"
        });
    }

    //Check if user exists in mongoose
    User.findOne({ email: email }, (err, user) => {
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

        //return JWT is success
        return res.status(200).json({
            message: "Login successful",
            token: user.generateAuthToken(),
            role: user.role
        });
    }
    );
});

//Test accounts:
//{"email": "cb.en.u4cse19352@cb.students.amrita.edu","password": "ey1xsd82l6qrynwgna7xm"}
//{"email": "soorya.s27@gmail.com","password": "soorya!1"}