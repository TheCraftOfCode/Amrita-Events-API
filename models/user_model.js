const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//require generateKey function from utils
const generateKey = require('../utils/generate_key');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },

    password: {
        type: String,
        required: true,
    },
    verificationKey: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: {
            values: ['user', 'admin', 'super_admin'],
            message: '{VALUE} is not a valid role'
        }
    },
    forgotPasswordCode: {
        type: String,
    },
    dateRegistered: {
        type: Date,
        default: Date.now,
    },
    listOfRSVPEvents: {
        type: [String],
        default: [],
        required: true
    },
    listOfStarredEvents: {
        type: [String],
        default: [],
        required: true
    },
    countOfStarredEvent: {
        type: Number,
        default: 0,
        required: true
    },
});

const UserTemporarySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {type: Date, expires: "15m", default: Date.now},
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        enum: {
            values: ['user', 'admin', 'super_admin'],
            message: '{VALUE} is not a valid role'
        }
    },
    emailVerificationToken: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({_id: this._id, verificationKey: this.verificationKey, role: this.role}, process.env.JWT_SECRET_KEY)
}

module.exports = {
    User: mongoose.model('User', UserSchema),
    UserTemporary: mongoose.model('UserTemporary', UserTemporarySchema),
    generateKey: generateKey
}
