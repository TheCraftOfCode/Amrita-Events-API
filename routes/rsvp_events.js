const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const {User} = require("../models/user_model");
const {Admin} = require("../models/admin_model");
VerifyAuth = require("../middleware/verify_auth", require)

router.post("/", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {

    //get user id from request
    let { id } = request.body;
    let userID = request.user._id
    console.log(userID)

    //check if id is not empty
    if (!id) {
        return response.status(400).send({
            message: "Please provide event id"
        });
    }

    //find event by id
    try {
        const CheckUser = await User.findById(userID);
        const CheckAdmin = await Admin.findById(userID);
        let user = CheckUser || CheckAdmin;
        console.log(user)

        if (!user) {
            return response.status(400).send({
                message: "User not found"
            });
        }
        //update listOfRSVPEvents in user
        
        if(user.listOfRSVPEvents.includes(id)){
            return response.status(400).send({
                message: "User already RSVPed for this event"
            });
        }
        //check if listOfRSVPEvents is undefined
        if (!user.listOfRSVPEvents) {
            user.listOfRSVPEvents = [];
        }
        user.listOfRSVPEvents.push(id);
        user.save(
            async (err, user) => {
                if (err) {
                    return response.status(400).send({
                        message: "Error updating user RSVP",
                        error: err.message || "Something went wrong"
                    })
                }
                let event = await Events.findById(id);
                event.countOfRSVP += 1;
                if(event.listOfRSVPUsers.includes(id)){
                    return response.status(400).send({
                        message: "User already RSVPed for this event"
                    });
                }
                //check if listOfRSVPEvents is undefined
                if (!event.listOfRSVPUsers) {
                    event.listOfRSVPUsers = [];
                }
                event.listOfRSVPUsers.push(id);
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
