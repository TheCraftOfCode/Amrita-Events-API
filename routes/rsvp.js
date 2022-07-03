const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const {User} = require("../models/user_model");
const verifyAuth = require("../middleware/verify_auth");
VerifyAuth = require("../middleware/verify_auth", require)

//RSVP for an event
router.post("/rsvp", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {

    //get user eventID from request
    let { eventID } = request.body;
    let userID = request.user._id
    console.log(userID)

    //check if eventID is not empty
    if (!eventID) {
        return response.status(400).send({
            message: "Please provide event eventID"
        });
    }

    //find event by eventID
    try {
        const user = await User.findById(userID);
        console.log(user)

        if (!user) {
            return response.status(400).send({
                message: "User not found"
            });
        }
        //update listOfRSVPEvents in user

        if(user.listOfRSVPEvents.includes(eventID)){
            return response.status(400).send({
                message: "User already RSVPed for this event"
            });
        }
        //check if listOfRSVPEvents is undefined
        if (!user.listOfRSVPEvents) {
            user.listOfRSVPEvents = [];
        }
        user.listOfRSVPEvents.push(eventID);
        user.save(
            async (err, user) => {
                if (err) {
                    return response.status(400).send({
                        message: "Error updating user RSVP",
                        error: err.message || "Something went wrong"
                    })
                }
                let event = await Events.findById(eventID);
                event.countOfRSVP += 1;
                event.save(
                    (err, event) => {
                        if (err) {
                            return response.status(400).send({
                                message: "Error updating event rsvp count",
                                error: err.message || "Something went wrong"
                            });
                        }
                        return response.status(200).send({
                            message: "Event updated successfully and added to user list",
                            event: event
                        });
                    }
                );

            }
        );

    }
    catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        })
    }

})

//get all rsvp'd events by a user
router.post("/getRSVPEvents", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    //get user id from request
    let id = request.user._id
    let getEventsIDOnly = request.body.getEventsIDOnly

    //check if id is not empty
    console.log(id)
    if (!id) {
        return response.status(400).send({
            message: "Please provide user id"
        });
    }

    try {
        //get list of rsvp events from user
        const user = await User.findById(id);
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

        if (getEventsIDOnly && getEventsIDOnly === true) {
            return response.status(200).send({
                message: "RSVPed events list",
                listOfRSVPEvents: listOfRSVPEvents
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
            message: "Fetched RSVPed events successfully",
            listOfRSVPEvents: events
        });
    }
    catch (e) {
        return response.status(400).send({
            message: "Error getting rsvp events",
            error: e.message || "Something went wrong"
        })
    }
})

//get all users RSVPd to a particular event
router.post('/getRSVPUsers', verifyAuth(["super_admin", "admin"], true), (req, res) => {
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
module.exports = router
