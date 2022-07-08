const mongoose = require("mongoose");

//TODO: Add poster url and host
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
    host: {
        type: String,
        required: true,
    },
    posterUrl: {
        type: String,
    },
    countOfRSVP: {
        type: Number,
        default: 0,
        required: true
    },
    listOfRSVPUsers: [
        {
            type: mongoose.Types.ObjectId,
            require: true,
            ref: "User"
        }
    ],
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

