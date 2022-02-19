//module to get all rsvp events from User collection
//add all imports
let express = require("express");
let router = express.Router();
const {User} = require("../models/user_model");
const {Admin} = require("../models/admin_model");
const Events = require("../models/events_model");

//route export
module.exports = router.post("/", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    //get user id from request
    let id = request.user._id

    //check if id is not empty
    console.log(id)
    if (!id) {
        return response.status(400).send({
            message: "Please provide user id"
        });
    }

    try {
        //get list of rsvp events from user
        const CheckUser = await User.findById(id);
        const CheckAdmin = await Admin.findById(id);
        let user = CheckUser || CheckAdmin;
        console.log(user)

        //check if user is not found
        if (!user) {
            return response.status(400).send({
                message: "User not found"
            });
        }

        let listOfRSVPEvents = user.listOfRSVPEvents;
        console.log(listOfRSVPEvents)
        //check if listOfRSVPEvents is undefined    
        if (!listOfRSVPEvents) {
            //return error if listOfRSVPEvents is undefined
            return response.status(400).send({
                message: "User has not RSVPed for any events"
            });
        }
        //return list of rsvp events
        // Get all events instead of ID and send events
        let events = await Events.find({
            _id: {
                $in: listOfRSVPEvents
            }
        });
        console.log(events)

        return response.status(200).send({
            events
        });
    }
    catch (e) {
        return response.status(400).send({
            message: "Error getting rsvp events",
            error: e.message || "Something went wrong"
        })
    }
})
