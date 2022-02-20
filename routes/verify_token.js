const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/verify_auth");

module.exports = router.post("/", verifyAuth(["admin", "super_admin", "user"], true), (req, res) => {
    const { _id } = req.body;
    //get the email, name and password from database using _id
    User.findById(_id, function (err, user) {
        if (!err) {
            //send the user data
            return res.status(200).send({
                message: "Token is valid",
                data: {
                    name: user.name,
                    role: user.role,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                }
            })
        } else {
            return res.status(500).send({
                message: "Failed to fetch user",
                error: err
            })
        }
    });
});

