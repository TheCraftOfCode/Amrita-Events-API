const Express = require("express");
const router = Express.Router();

//TODO: Notify on FCM on every new events added
const moment = require("moment");
VerifyAuth = require("../middleware/verify_auth")
const Events = require("../models/events_model");

router.post("/", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    //get eventName date time location description countOfRSVP eventType 
    let { eventName, date, time, location, description, eventType } = request.body;

    //validate eventName
    if (!eventName) {
        return response.status(400).send({
            message: "Please provide event name"
        });
    }

    //validate date
    if (!date) {
        return response.status(400).send({
            message: "Please provide date"
        });
    }

    //check if date is valid
    if (!moment(date, "DD-MM-YYYY", true).isValid()) {
        return response.status(400).send({
            message: "Please provide valid date"
        });
    }

    //validate time
    if (!time) {
        return response.status(400).send({
            message: "Please provide time"
        });
    }

    //check if time is valid
    if (!moment(time, "HH:mm a", true).isValid()) {
        return response.status(400).send({
            message: "Please provide valid time"
        });
    }

    //validate location
    if (!location) {
        return response.status(400).send({
            message: "Please provide location of event"
        });
    }

    //validate description
    if (!description) {
        return response.status(400).send({
            message: "Please provide description of event"
        });
    }

    //validate eventType
    if (!eventType) {
        return response.status(400).send({
            message: "Please provide event type"
        });
    }

    //check if eventType is valid
    if (!["CULTURAL", "TECHNICAL", "SPIRITUAL"].includes(eventType)) {
        return response.status(400).send({
            message: "Please provide valid event type"
        });
    }

    //save event to database
    const event = new Events({
        eventName: eventName,
        date: date,
        time: time,
        location: location,
        description: description,
        eventType: eventType,
    });
    
    event.save(
        function (err, event) {
            if (err) {
                return response.status(400).send({
                    message: "Error saving event"
                });
            }
            return response.status(200).send({
                message: "Event saved successfully",
                event: event
            });
        }
    )

});

module.exports = router
