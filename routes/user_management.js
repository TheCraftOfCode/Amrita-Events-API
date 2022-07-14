const Express = require("express");
const router = Express.Router();
const {UserTemporary, generateKey, User} = require("../models/user_model");
let VerifyAuth = require("../middleware/verify_auth")
const bcrypt = require("bcrypt");
const {passwordStrength} = require('check-password-strength')
const emailValidator = require("email-validator");
const nodemailer = require("nodemailer");

function sendVerificationMail(host, id, email, response, user) {
    try {
        let link = host + "/user/verifyEmail?id=" + id + "&email=" + email;

        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: process.env.EMAIL, pass: process.env.PASSWORD
            },
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Amrita events verification mail",
            text: "Please confirm your email by clicking on this link, this link will expire in 15 minutes",
            html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                user.remove().then(r => console.log(r, "Removed temporary instance"));
                return response.status(500).send({
                    message: "Failed to send verification mail",
                    error: error
                })
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({
                    message: "Verification mail sent"
                })
            }
        });
    } catch (e) {
        console.log(e)
        user.remove().then(r => console.log(r, "Removed temporary instance"));
        return response.status(500).send({
            message: "Failed to send verification mail",
            error: e
        })
    }
}

function sendConfirmation(email, response, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: process.env.EMAIL, pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: subject,
            text: text

        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return response.status(500).send({
                    message: "Failed to send confirmation mail",
                    error: error
                })
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({
                    message: "Confirmation mail sent successfully"
                })
            }
        });
    } catch (e) {
        console.log(e)
        return response.status(500).send({
            message: "Failed to send confirmation mail",
            error: e
        })
    }
}

function sendPasswordCode(email, code, response) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: process.env.EMAIL, pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Password change code",
            text: "To change your password, use this code in the forgot password section: " + code

        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                return response.status(500).send({
                    message: "Failed to send confirmation mail",
                    error: error
                })
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({
                    message: "Conformation mail sent successfully"
                })
            }
        });
    } catch (e) {
        console.log(e)
        return response.status(500).send({
            message: "Failed to send confirmation mail",
            error: e
        })
    }
}

//register
router.post("/register", VerifyAuth('', false), async (request, response) => {

    const email = request.body.email
    const name = request.body.name
    const password = request.body.password

    const verifyPassword = passwordStrength(password)

    //check
    if (!email) {
        return response.status(400).send({
            message: "Email is required"
        })
    } else if (!emailValidator.validate(email)) {

        return response.status(400).send({
            message: "Email is not valid"
        })
    }
    if (!password) {
        return response.status(400).send({
            message: "Password is required"
        })
    } else if (verifyPassword.id < 2) {
        return response.status(400).send({
            message: "Password is too weak"
        })
    }


    if (!name) {
        return response.status(400).send({
            message: "Name is required"
        })
    } else if (name.length < 3) {
        return response.status(400).send({
            message: "Name is too short"
        })
    }


    const checkExistingUser = await User.findOne({
        email: email,
    });

    const checkExistingUserTemporary = await UserTemporary.findOne({
        email: email,
    });

    if (checkExistingUser) {
        return response.status(400).send({
            message: "User already exists"
        })
    }
    if (checkExistingUserTemporary) {
        return response.status(400).send({
            message: "User already exists"
        })
    }

    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);

    let verificationToken = generateKey()

    const createNewTemporaryInstance = new UserTemporary({
        email: email,
        name: name,
        password: hashedPassword,
        role: "user",
        emailVerificationToken: verificationToken
    });


    await createNewTemporaryInstance.save()
        .then(user => sendVerificationMail(process.env.HOST, verificationToken, email, response, user))
        .catch(err => {
            return response.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            })
        })
})

//login
router.post("/login", (req, res) => {

    //get the email and password from the request body
    const {email} = req.body;
    const {password} = req.body;

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
    User.findOne({email: email}, (err, user) => {
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
                name: user.name,
                role: user.role,
                dateRegistered: user.dateRegistered,
                email: user.email
            });
        }
    );
});

//verify
router.get('/verifyEmail', async function (request, response) {
    if (!request.query.id || !request.query.email) {
        response.send('Invalid Link')
    } else {
        const checkExistingUserTemporary = await UserTemporary.findOne({
            email: request.query.email,
        });

        const checkExistingUser = await User.findOne({
            email: request.query.email,
        });

        if (!checkExistingUserTemporary) {
            response.send('Registration Link Expired')
        } else if (checkExistingUser) {
            response.send('This account has already been verified and created')
        } else {
            if (checkExistingUserTemporary.emailVerificationToken === request.query.id) {
                checkExistingUserTemporary.remove().then(async r => {

                    const createFinalInstance = new User({
                        email: r.email,
                        name: r.name,
                        password: r.password,
                        role: r.role,
                        verificationKey: generateKey()
                    });

                    await createFinalInstance.save()
                        .then(user => response.status(200).send("Account has been created!"))
                        .catch(err => response.status(500).send("Could not create account, please try again later"))
                });


            } else {
                checkExistingUserTemporary.remove().then(r => console.log(r));
                response.send("Invalid Link")
            }
        }
    }
})

//delete account
router.post('/delete', VerifyAuth(['admin', 'super_admin', 'user'], true), async (request, response) => {
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
        const user = await User.findById(id);
        console.log(user)

        //check if user is not found
        if (!user) {
            return response.status(400).send({
                message: "User not found"
            });
        }

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
                    userId: id
                })
            }
        )
    } catch (e) {
        return response.status(400).send({
            message: "Error deleting user",
            error: e.message || "Something went wrong"
        })
    }
})

//change password
router.post("/changePassword", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    const id = request.user._id;
    console.log(id)
    const newPassword = request.body.newPassword;
    const currentPassword = request.body.currentPassword;

    try {

        const checkUser = await User.findById(id);

        if (!checkUser)
            return response.status(400).send({
                message: "User not found"
            });

        const verifyPassword = passwordStrength(newPassword)

        if (!newPassword) {
            return response.status(400).send({
                message: "Please attach a new password"
            });

        } else if (verifyPassword.id < 2) {
            return response.status(400).send({
                message: "Password is not strong enough"
            });
        }

        if (!currentPassword) {
            return response.status(400).send({
                message: "Please attach your current password"
            });
        }


        const compareCurrentPassword = await bcrypt.compare(
            currentPassword,
            checkUser.password
        );

        const newPasswordCheck = await bcrypt.compare(
            newPassword,
            checkUser.password
        );
        if (!compareCurrentPassword) {
            return response.status(403).send({
                message: "Current password is incorrect",
            });
        } else if (newPasswordCheck) {
            return response.status(400).send({
                message: "New password cannot be the same as the current password"
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const HashedPassword = await bcrypt.hash(newPassword, salt);
            checkUser.updateOne({
                password: HashedPassword,
                verificationKey: generateKey()
            }, async function (err, raw) {
                if (err) {
                    response.status(500).send({
                        message: "Failed to change password",
                        error: err
                    });
                }
                let updatedDoc = await User.findById(id);
                return response.status(200).send({
                    message: "Password changed successfully",
                    token: updatedDoc.generateAuthToken()
                });

            });
        }
    } catch (e) {
        console.log(e)
        return response.status(400).send({
            message: "Failed to change password",
            error: e
        });
    }

});

router.post("/verifyToken", VerifyAuth(["admin", "super_admin", "user"], true), async (request, res) => {
    const id = request.user._id;
    User.findById(id, function (err, user) {
        if (!err) {
            //send the user data
            if (user)
                return res.status(200).send({
                    message: "Token is valid",
                    data: {
                        name: user.name,
                        role: user.role,
                        email: user.email,
                    }
                })
            else {
                return res.status(400).send({
                    message: "User not found",
                })
            }

        } else {
            return res.status(500).send({
                message: "Failed to fetch user",
                error: err
            })
        }
    });
});


router.post("/forgotPassword", async (request, response) => {

    const email = request.body.email

    if (!email) {
        return response.status(400).send({
            message: "Email is required"
        });

    } else if (!emailValidator.validate(email)) {
        return response.status(400).send({
            message: "Email is invalid"
        });
    }

    const checkExistingUser = await User.findOne({
        email: email,
    });

    if (!checkExistingUser)
        return response.status(400)
            .send({
                message: "User with this email does not exist"
            });

    let verificationKey = generateKey()
    checkExistingUser.forgotPasswordCode = verificationKey

    await checkExistingUser.save()
        .then(user => sendPasswordCode(email, verificationKey, response))
        .catch(err => {
            return response.status(400).send({
                message: "Failed to send confirmation mail",
                error: err
            })
        })


})


router.post("/forgotPasswordVerify", async (request, response) => {

    const email = request.body.email
    const password = request.body.password
    const forgotPasswordCode = request.body.forgotPasswordCode

    //get userdata using email
    const user = await User.findOne({email: email});

    //return if user not found
    if (!user) {
        return response.status(404).send({
            message: "User not found"
        })
    }

    if (!email) {
        return response.status(400).send({
            message: "Email is required"
        });

    } else if (!emailValidator.validate(email)) {
        return response.status(400).send({
            message: "Email is invalid"
        });
    }

    if (!forgotPasswordCode) {
        return response.status(400).send({
            message: "Forgot password code is required"
        });
    }

    const verifyPassword = passwordStrength(password)

    if (!password) {
        return response.status(400).send({
            message: "Password is required"
        });

    } else if (verifyPassword.id < 2) {
        return response.status(400).send({
            message: "Password is weak"
        });
    }

    const checkExistingUser = await User.findOne({
        email: email,
    });

    if (checkExistingUser.forgotPasswordCode !== forgotPasswordCode)
        return response.status(400).send({
            message: "Forgot password code is invalid"
        });

    const newPasswordCheck = await bcrypt.compare(
        password,
        user.password
    );

    //if new password is same as old password return error
    if (newPasswordCheck) {
        return response.status(400).send({
            message: "New password is same as old password"
        });
    }

    if (!checkExistingUser)
        return response.status(400)
            .send({
                message: "User does not exist"
            });


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    checkExistingUser.updateOne({
        password: hashedPassword,
        verificationKey: generateKey(),
        forgotPasswordCode: ""
    }, async function (err, raw) {
        if (err) {
            response.send({
                message: "Failed to change password",
                error: err
            });
        }
        const updatedDoc = await User.findOne({
            email: email,
        });
        return response.status(200).send({
            message: "Password changed successfully",
            token: updatedDoc.generateAuthToken()
        });

    });

    await checkExistingUser.save()
        .then(user => sendConfirmation(email, response, "Password Reset", "Your password has been reset successfully, login with the new password"))
        .catch(err => {
            return response.status(500).send({
                message: err.message || "Some error occurred while changing the password"
            })
        })


})

router.post("/userStats", VerifyAuth(["admin", "super_admin", "user"], true), (req, res) => {
    const id = req.user._id;
    console.log(id)
    User.findById(id, function (err, user) {
        if (!err) {
            //send the user data
            if (user){
                return res.status(200).send({
                    message: "Stats found",
                    rsvp: user.listOfRSVPEvents.length,
                    starred: user.countOfStarredEvent
                })
            }

            else {
                return res.status(400).send({
                    message: "User not found",
                })
            }

        } else {
            return res.status(500).send({
                message: "Failed to fetch user",
                error: err
            })
        }
    });
})


module.exports = router



