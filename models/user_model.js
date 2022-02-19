const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

//require generateKey function from utils
const generateKey = require('../utils/generate_key');



const UserSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        userID: {
            type: String,
            required: true,
            unique: true,

        },
        verificationKey: {
            type: String,
            required: true
        },
    }
)

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({_id: this._id, verificationKey: this.verificationKey, role: "user"}, 'mysecretkey')
}

module.exports = {
    User: mongoose.model('User', UserSchema),
    generateKey: generateKey
}
