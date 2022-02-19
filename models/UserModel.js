const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

function generateKey() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 16; i++) {
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

//add module to generate JWT
//TODO: export JWT signing key to environment variables
UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id, verificationKey: this.verificationKey }, 'mysecretkey')
    return token
}

module.exports = {
    User: mongoose.model('User', UserSchema),
    generateKey: generateKey
}