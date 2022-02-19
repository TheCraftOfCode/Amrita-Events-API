const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
//replace const with const

function generateKey() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

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
    return jwt.sign({_id: this._id, verificationKey: this.verificationKey}, 'mysecretkey')
}

module.exports = {
    User: mongoose.model('User', UserSchema),
    generateKey: generateKey
}
