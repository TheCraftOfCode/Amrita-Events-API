const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date
        }
    }
)


module.exports = {
    NotificationModel: mongoose.model('NotificationModel', NotificationSchema),
}
