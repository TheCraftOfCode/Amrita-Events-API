const Express = require("express");
const router = Express.Router();
const {NotificationModel} = require("../models/notification_model");
VerifyAuth = require("../middleware/verify_auth", require)
const notification = require("../utils/notification")

router.post("/getNotifications", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
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

router.post("/sendNotification", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    let {title, body} = request.body

    if(!title){
        return response.status(400).send({
            message: "Please attach title of notification"
        })
    }

    if(!body){
        return response.status(400).send({
            message: "Please attach body of notification"
        })
    }

    notification(title, body, {}, "main").then(r => {
        return response.status(200).send({"message": "Sent notification successfully"});

    }).catch(r => {
        return response.status(400).send({
            "message": "Something went wrong",
            "error": r
        });
    });


})

module.exports = router
