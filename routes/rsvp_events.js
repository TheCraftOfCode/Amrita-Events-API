const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const {User} = require("../models/user_model");
VerifyAuth = require("../middleware/verify_auth", require)

router.post("/", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {

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

module.exports = router
