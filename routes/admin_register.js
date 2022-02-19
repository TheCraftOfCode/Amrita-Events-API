//Registration for Admin
//import the required modules
const bcrypt = require('bcrypt');
const express = require("express");
const router = express.Router();
const { Admin, generateKey } = require("../models/admin_model");
const emailValidator = require("email-validator");
//import node mailer
const nodemailer = require('nodemailer');
const verifyAuth = require("../middleware/verify_auth");

function sendMailToUser(email, response, user, password) {
    try {

        //change credentials to different account
        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: "events.amritacbe@gmail.com", pass: "amritaevents2022"
            }
        });

        let mailOptions = {
            from: "events.amritacbe@gmail.com",
            to: email,
            subject: "Account creation for Admin Profile",
            text: "Your account has been created, use this password to login: " + password,
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                user.remove().then(r => console.log(r, "Failed to remove unused account"));
                return response.status(500).send(error)
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send("New admin user has been registered with the attached account")
            }
        });
    } catch (e) {
        console.log(e)
        user.remove().then(r => console.log(r, "Failed to remove unused account"));
        return response.status(500).send(e)
    }
}

//export admin registration route

module.exports = router.post("/", verifyAuth(["super_admin"], true), (req, res) => {
    //get the email, name and password from the request body
    const { name } = req.body;
    const { email } = req.body;

    //validate name and email
    if (!name) {
        return res.status(400).json({
            message: "Name is required"
        });
    }

    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }
    //check if email is valid using emailValidator
    else if (!emailValidator.validate(email)) {
        return res.status(400).json({
            message: "Email is invalid"
        });
    }

    //generate random password for the admin
    const password = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    console.log(password);

    //hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                message: "Error hashing password"
            });
        } else {
            //create a new admin user
            const admin = new Admin({
                name,
                email,
                password: hash,
                role: "admin",
                verificationKey: generateKey()
            });

            //save the admin user
            admin.save()
                .then(result => {
                    //send the generated password to the user
                    sendMailToUser(
                        email,
                        res,
                        result,
                        password
                    )
                })
                .catch(err => {
                    //send the error message
                    if (err.code === 11000) {
                        return res.status(400).json({
                            message: "User already exists"
                        });
                    }
                    else{
                        return res.status(500).json({
                            message: "Internal server error",
                            error: err.message
                        });
                    }
                });
        }
    }
    );
    

});