//imports
const express = require('express');
const router = express.Router();
const { User } = require('../models/user_model');
const { Admin } = require('../models/admin_model');
//auth
const verifyAuth = require('../middleware/verify_auth');

//get all users or admin who rsvpd to a specific event
router.post('/', verifyAuth(["super_admin", "admin"], true), (req, res) => {
    //get event id from body
    const { eventId } = req.body;

    //validate event id
    if (!eventId) {
        return res.status(400).json({
            message: "Event id is required"
        });
    }

    //get all users who rsvpd to the event
    User.find({
        listOfRSVPEvents: eventId
    }, (err, users) => {
        if (err) {
            return res.status(500).json({
                message: "Error getting users"
            });
        }

        if (!users) {
            return res.status(404).json({
                message: "Users not found"
            });
        }

        return res.status(200).json({
            message: "Users fetched successfully",
            users: users
        });
    });
});

//export
module.exports = router;
