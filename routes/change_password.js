const Express = require("express");
const router = Express.Router();
const { User } = require("../models/user_model");
const { generateKey } = require("../models/user_model");
const { Admin } = require("../models/admin_model");
const bcrypt = require("bcrypt");
VerifyAuth = require("../middleware/verify_auth", require)

router.post("/", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    const id = request.user._id;
    const newPassword = request.body.newPassword;
    const currentPassword = request.body.currentPassword;

    try {

        const CheckUser = await User.findById(id);
        const CheckAdmin = await Admin.findById(id);
        let user = CheckUser || CheckAdmin;

        //check if user exists
        if (!user) {
            return response.status(400).json({
                message: "User does not exist"
            });
        }

        //check if current password is not empty
        if (!currentPassword) {
            return response.status(400).json({
                message: "Current password is required"
            });
        }

        //check if newPassword is valid
        if (!newPassword) {
            return response.status(400).json({
                message: "New password is required"
            });
        }

        if (newPassword.length < 6) {
            return response.status(400).json({
                message: "Password must be at least 6 characters long"
            });

            //check if password has special symbols
        } else if (!newPassword.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) {
            return response.status(400).json({
                message: "Password must contain at least one special symbol"
            });
            //check if password has numbers
        } else if (!newPassword.match(/[0-9]/)) {
            return response.status(400).json({
                message: "Password must contain at least one number"
            });
        }

        const compareCurrentPassword = await bcrypt.compare(
            currentPassword,
            user.password
        );

        const compareNewPassword = await bcrypt.compare(
            newPassword,
            user.password
        );

        //check if compareCurrentPassword is true and return message
        if (!compareCurrentPassword) {
            return response.status(400).json({
                message: "Current password is incorrect"
            });
        }

        //check if compareNewPassword is true and return message
        else if (compareNewPassword) {
            return response.status(400).json({
                message: "New password cannot be the same as the current password"
            });

        } else {
            //bcrypt password
            const saltRounds = 10;
            const salt = bcrypt.genSaltSync(saltRounds);
            const hash = bcrypt.hashSync(newPassword, salt);

            //update password to user
            user.password = hash;
            //update verificationKey
            user.verificationKey = generateKey();
            //save user return message
            user.save(err => {
                if (err) {
                    return response.status(400).json({
                        message: "Error updating password"
                    });
                }
                return response.status(200).json({
                    message: "Password updated successfully",
                    user: user
                });
            });

        }
    } catch (e) {
        console.log(e)
        return response.status(400).send(e);
    }

});

module.exports = router;
