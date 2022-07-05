const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const {User} = require("../models/user_model");
const VerifyAuth = require("../middleware/verify_auth");

//RSVP for an event
router.post("/rsvp", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {

    //get user eventID from request
    let {eventId} = request.body;
    let userID = request.user._id
    console.log(userID)

    //check if eventID is not empty
    if (!eventId) {
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

        if (user.listOfRSVPEvents.includes(eventId)) {
            return response.status(400).send({
                message: "User already RSVPed for this event"
            });
        }
        //check if listOfRSVPEvents is undefined
        if (!user.listOfRSVPEvents) {
            user.listOfRSVPEvents = [];
        }
        user.listOfRSVPEvents.push(eventId);
        user.save(
            async (err, user) => {
                if (err) {
                    return response.status(400).send({
                        message: "Error updating user RSVP",
                        error: err.message || "Something went wrong"
                    })
                }
                let event = await Events.findById(eventId);
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

    } catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        })
    }

})

//get all users RSVPd to a particular event
router.post('/getRSVP', VerifyAuth(["super_admin", "admin"], true), async (req, res) => {

    const users = await User.find({}).lean().select("-_id -password -verificationKey -role -__v")

    Events.find({}).select("").lean().exec(async (err, event) => {

        event.forEach(function (eventData) {
            eventData.users = []
            let eventDate = eventData.date
            event.dateUnparsed = eventDate
            eventData.date = eventDate.toLocaleDateString();
            eventData.time = eventDate.toLocaleTimeString();
            users.forEach(function (userData) {
                //get all users RSVPd to this particular event from users
                console.log(eventData, eventData._id, userData.listOfRSVPEvents)
                console.log(userData.listOfRSVPEvents.includes(eventData._id.toString()))
                if(userData.listOfRSVPEvents.includes(eventData._id.toString())){
                    eventData.users.push(userData)
                }

            })


        })

        return res.status(200).json({
            message: "Users fetched successfully",
            event: event
        });
    })

});
module.exports = router
