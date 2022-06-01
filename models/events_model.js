const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    countOfRSVP: {
        type: Number,
        default: 0,
    },
    eventType: {
        type: String,
        required: true,
        enum: {
            values: ["CULTURAL", "TECHNICAL", "SPIRITUAL"],
            message: '{VALUE} is not a valid event type'
        }
    },
    eventOver: {
        type: Boolean,
        default: false
    },
})

module.exports = mongoose.model("Events", EventSchema)

