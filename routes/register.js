const Express = require("express");
const router = Express.Router();
const bcrypt = require("bcrypt");
const { User, generateKey } = require("../models/user_model");
const {getAuth} = require("firebase-admin/auth");

//Register using phone number and no email firebase

module.exports = router.post("/", (req, res) => {
    const { name } = req.body;
    const { password } = req.body;

    //receive firebase jwt
    const { firebaseToken } = req.body;

    //check if firebase token is nit empty
    if (!firebaseToken) {
        return res.status(400).json({
            message: "Firebase token is empty"
        });
    }

    //verify firebase token
    getAuth()
        .verifyIdToken(firebaseToken)
        .then((decodedToken) => {
            console.log(decodedToken)
            const uid = decodedToken.uid;
            const phoneNumber = decodedToken.phone_number

            //Check if name is valid
            if (!name) {
                return res.status(400).json({
                    message: "Name is required"
                });
            }

            //check if name has numbers
            if (name.match(/[0-9]/)) {
                return res.status(400).json({
                    message: "Name cannot contain numbers"
                });
            }

            //Check if phone number is valid
            if (!phoneNumber) {
                return res.status(400).json({
                    message: "Phone number is required"
                });
            }



            //Check if password is valid
            if (!password) {
                return res.status(400).json({
                    message: "Password is required"
                });
            }

            //check password strength
            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters long"
                });

                //check if password has special symbols
            } else if (!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
                return res.status(400).json({
                    message: "Password must contain at least one special symbol"
                });
                //check if password has numbers
            } else if (!password.match(/[0-9]/)) {
                return res.status(400).json({
                    message: "Password must contain at least one number"
                });
            }

            //bcrypt password
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(password, salt);

            //save to mongoose
            const user = new User({
                phoneNumber: phoneNumber,
                password: hash,
                name: name,
                userID: uid,
                verificationKey: generateKey()
            });

            //promise from save
            user.save(
                (err, user) => {
                    //check if err is not null
                    if (err)
                        if (err.code === 11000) {
                            return res.status(400).json({
                                message: "User already exists"
                            });
                        }
                        else {
                            return res.status(500).json({
                                message: "Internal server error",
                                error: err
                            });
                        }
                    else
                        //If no error, send back success message
                        return res.status(200).json({
                            message: "Successfully registered",
                            user: user
                        });
                }
            )
        })
        .catch((error) => {
            console.log(error);
            //return error
            res.status(400).json({
                message: "Invalid firebase token",
            });
        });

})
