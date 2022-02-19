//Admin user schema with roles as admin and super_admin
// Language: javascript
// Path: models/AdminModel.js
// Compare this snippet from routes/register.js:

//mongoose schema:
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const generateKey = require('../utils/generateKey');

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
            required: true
        },
        verificationKey: {
            type: String,
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