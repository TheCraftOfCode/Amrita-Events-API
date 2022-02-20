//route to update phone number
//import all the required modules for route
const express = require("express");
const router = express.Router();
//verify_auth
const verifyAuth = require("../middleware/verify_auth");
const { User, generateKey } = require("../models/user_model");
const { getAuth } = require("firebase-admin/auth");

//route with verifyAuth as user 
router.post("/", verifyAuth(["user"], true), async (request, response) => {
    //get the user id from the request
    const id = request.user._id;
    //decode firebase auth token
    const { firebaseToken } = request.body;
    //check if firebase token is not empty
    if (!firebaseToken) {
        return response.status(400).json({
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
            //check if phone number is valid
            if (!phoneNumber) {
                return response.status(400).json({
                    message: "Phone number is required"
                });
            }
            //update phone number in firebase
            getAuth()
                .updateUser(uid, {
                    phoneNumber: phoneNumber
                })
                .then(() => {
                    //update phone number and verificationToken in user model and return JWT if success
                    User.findByIdAndUpdate(id, {
                        phoneNumber: phoneNumber,
                        verificationToken: generateKey()
                    }, { new: true }, (err, user) => {
                        if (!err) {
                            return response.status(200).json({
                                message: "Phone number updated successfully",
                                token: user.generateAuthToken()
                            });
                        } else {
                            return response.status(500).json({
                                message: "Failed to update phone number",
                                error: err
                            });
                        }
                    }
                    );
                }).catch((err) => {
                    return response.status(500).json({
                        message: "Failed to update phone number",
                        error: err
                    });
                }
                );

        }
        )
        .catch((error) => {
            return response.status(400).json({
                message: "Firebase token is invalid",
                error: error
            });
        }
        );
});

module.exports = router;





