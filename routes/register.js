const Express = require("express");
const router = Express.Router();
const {UserTemporary, generateKey, User} = require("../models/user_model");
let VerifyAuth
const bcrypt = require("bcrypt");
const {passwordStrength} = require('check-password-strength')
const emailValidator = require("email-validator");
const nodemailer = require("nodemailer");
VerifyAuth = require("../middleware/verify_auth")

function sendMailToUser(host, id, email, response, user) {
    try {
        let link = host + "/verifyEmail?id=" + id + "&email=" + email;

        const transporter = nodemailer.createTransport({
            service: 'gmail', auth: {
                user: process.env.EMAIL, pass: process.env.PASSWORD
            },
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: "Amritotsavam verification mail",
            text: "Please confirm your email by clicking on this link, this link will expire in 15 minutes",
            html: "Hello,<br> Please Click on the link to verify your email.<br><a href=" + link + ">Click here to verify</a>"
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                user.remove().then(r => console.log(r, "Failed to remove temporary instance"));
                return response.status(500).send({
                    message: "Failed to send verification mail",
                    error: error
                })
            } else {
                console.log('Email sent: ' + info.response);
                return response.status(200).send({
                    message: "Verification mail sent",
                    user: user
                })
            }
        });
    } catch (e) {
        console.log(e)
        user.remove().then(r => console.log(r, "Failed to remove temporary instance"));
        return response.status(500).send({
            message: "Failed to send verification mail",
            error: e
        })
    }
}

module.exports = router.post("/", VerifyAuth('', false), async (request, response) => {

    const email = request.body.email
    const name = request.body.name
    const password = request.body.password
    let userId = ""


    const verifyPassword = passwordStrength(password)

    //check
    if (!password) {
        return response.status(400).send({
            message: "Password is required"
        })
    } else if (verifyPassword.id < 2) {
        return response.status(400).send({
            message: "Password is too weak"
        })
    }
    if (!email) {
        return response.status(400).send({
            message: "Email is required"
        })
    } else if (!emailValidator.validate(email)) {

        return response.status(400).send({
            message: "Email is not valid"
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
        .then(user => sendMailToUser("https://amritotsavam-api.herokuapp.com", verificationToken, email, response, user))
        .catch(err => {
            return response.status(500).send({
                message: err.message || "Some error occurred while creating the User."
            })
        })
})



