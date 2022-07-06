const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const {User} = require("../models/user_model");
const VerifyAuth = require("../middleware/verify_auth");
const mongoose = require("mongoose");
const ObjectsToCsv = require('objects-to-csv')

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
                if(!event) return response.status(400).send({
                    message: "Event not found"
                })
                event.countOfRSVP += 1;
                event.listOfRSVPUsers.push(mongoose.Types.ObjectId(userID));
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

    Events.find({}).populate("listOfRSVPUsers", 'email name role -_id').select("").lean().exec(async (err, event) => {

        event.forEach(function (eventData) {
            let eventDate = eventData.date
            event.dateUnparsed = eventDate
            eventData.date = eventDate.toLocaleDateString();
            eventData.time = eventDate.toLocaleTimeString();
        })

        return res.status(200).json({
            message: "Users fetched successfully",
            event: event
        });
    })

});

router.post('/getRSVPdCSV', VerifyAuth(["super_admin", "admin"], true), async (req, res) => {


    const eventId = req.body.eventId

    if (!eventId) {
        return res.status(400).send({
            message: "Please add event Id"
        })
    }

    Events.findById(eventId).select("-__v -posterUrl -description -eventOver").lean().populate("listOfRSVPUsers", 'email name role -_id')
        .then(async function (p) {
            //parse data
            const csvData = []
            const users = p.listOfRSVPUsers
            users.forEach(function (data) {
                let rowData = {
                    EventID: p._id,
                    eventName: p.eventName,
                    location: p.location,
                    host: p.host,
                    eventType: p.eventType,
                    countOfRSVPUsers: p.countOfRSVP,
                    email: data.email,
                    name: data.name,
                    role: data.role

                }
                csvData.push(rowData)
            })
            const csv = new ObjectsToCsv(csvData)
            await csv.toDisk('./list.csv')
            res.download('./list.csv', `${p.eventName.replace(/\s/g, '')}.csv`)
        })
        .catch(error => console.log(error));
})

module.exports = router
