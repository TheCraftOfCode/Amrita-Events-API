const admin = require("firebase-admin");
const {NotificationModel} = require("../models/notification_model")

module.exports = function (title, body, data, topic) {
    let notification = new NotificationModel({
        title: title,
        body: body,
    })
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
