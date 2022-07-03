const bcrypt = require('bcrypt');
const express = require("express");
const router = express.Router();
const emailValidator = require("email-validator");
const nodemailer = require('nodemailer');
const VerifyAuth = require("../middleware/verify_auth");
const {generateKey, User} = require("../models/user_model");

function sendMailToUser(email, response, user, password) {
    try {

        //change credentials to different account
        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: process.env.EMAIL, pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Account creation for Admin Profile",
            text: "Your account has been created, use this password to login: " + password,
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                user.remove().then(r => console.log(r, "Failed to remove unused account"));
                return response.status(500).send({
                    message: "Failed to send email",
                    error: error
                })
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({
                    message: "Email sent successfully",
                    info: info
                })
            }
        });
    } catch (e) {
        console.log(e)
        user.remove().then(r => console.log(r, "Failed to remove unused account"));
        return response.status(500).send({
            message: "Failed to send email",
            error: e
        })
    }
}

//register an account for an admin
router.post("/register", VerifyAuth(["super_admin"], true), (req, res) => {
    //get the email, name and password from the request body
    const {name} = req.body;
    const {email} = req.body;

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
                const admin = new User({
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
                        } else {
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

router.post('/delete', VerifyAuth(["super_admin", "admin"], true), (req, res) => {
    //get the email from the request body
    const {email} = req.body;

    //validate email
    if (!email) {
        return res.status(400).json({
            message: "Email is required"
        });
    }

    const userToDelete = User.findOne({email: email})

    if (!userToDelete) {
        return res.status(400).send({
            message: "User not found"
        })
    }

    //admin can only delete user
    if (req.user.role === "admin") {
        if (["super_admin", "admin"].includes(userToDelete.role)) {
            return res.status(400).send({
                message: "You are attempting to delete an admin, you are not authorised to perform this action"
            })
        }
    }
    //super admin cannot delete super admin
    else if (req.user.role === "super_admin") {
        if (userToDelete.role === "super_admin") {
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

//get list of users
router.post('/getUsers', VerifyAuth(["super_admin", "admin"], true), (req, res) => {

    //get user type in body
    const {userType} = req.body;

    if (!userType) {
        return res.status(400).send({
            message: "Please attach user type"
        })
    }

    if (!['user', 'admin', 'super_admin'].includes(userType)) {
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

module.exports = router