const Express = require("express");
const router = Express.Router();
const {NotificationModel} = require("../models/notification_model");
VerifyAuth = require("../middleware/verify_auth", require)

router.post("/", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    NotificationModel.find({}, function (err, data) {
        if (!err) {
            return response.status(200).send({
                message: "Notifications fetched successfully",
                data: data
            })
        } else {
            return response.status(500).send({
                message: "Failed to fetch notifications",
                error: err
            })
        }
    });
})

module.exports = router
