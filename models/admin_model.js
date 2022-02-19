const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const generateKey = require('../utils/generate_key');

//creating the schema for the admin user with email instead of phone number
const AdminSchema = new mongoose.Schema(
    {

        email: {
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
        role: {
            type: String,
            required: true,
            enum: {
                values: ['admin', 'super_admin'],
                message: '{VALUE} is not a valid role'
            }
        },
        verificationKey: {
            type: String,
            required: true
        },
        listOfRSVPEvents: {
            type: [String],
            default: [],
            required: true
        },

    }
);

//generating the token for the admin user
AdminSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, verificationKey: this.verificationKey, role: this.role }, 'mysecretkey')
}

//export the admin schema
module.exports = {
    Admin: mongoose.model("Admin", AdminSchema),
    generateKey: generateKey
};