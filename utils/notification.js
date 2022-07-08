const admin = require("firebase-admin");
const {NotificationModel} = require("../models/notification_model")
const {broadcast} = require("../config/websocket");

module.exports = function (title, body, data, topic) {
    let notification = new NotificationModel({
        title: title,
        body: body,
    })
    broadcast(JSON.stringify({
        message: `A notification was pushed`,
        type: "notification",
        data: notification
    }))
    notification.save();
    return admin.messaging().send({
        notification: {
            title: title,
            body: body,
        },
        data: data,
        android: {
            priority: "high",
        },
        // Add APNS (Apple) config
        apns: {
            payload: {
                aps: {
                    contentAvailable: true,
                },
            },
            headers: {
                "apns-topic": "io.flutter.plugins.firebase.messaging", // bundle identifier
            },
        },
        topic: topic
    })
}
