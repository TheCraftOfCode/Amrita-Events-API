const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const moment = require("moment");
VerifyAuth = require("../middleware/verify_auth")

router.post("/", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    //modify event data
    let { eventName, date, time, location, description, eventType, eventOver } = request.body;

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

    //validate eventOver
    console.log(eventOver);
    if (!eventOver && eventOver !== false) {
        return response.status(400).send({
            message: "Please provide event over"
        });
    }

    //check if eventType is valid
    if (!["CULTURAL", "TECHNICAL", "SPIRITUAL"].includes(eventType)) {
        return response.status(400).send({
            message: "Please provide valid event type"
        });
    }

    //modify event
    try {
        let event = await Events.findById(request.body.id);

        if (!event) {
            return response.status(404).send({
                message: "Event not found"
            });
        }

        event.eventName = eventName;
        event.date = date;
        event.time = time;
        event.location = location;
        event.description = description;
        event.eventType = eventType;
        event.eventOver = eventOver;

        await event.save(
            (err, event) => {
                if (err) {
                    return response.status(500).send({
                        message: err.message || "Some error occurred while updating the event."
                    });
                }
                return response.status(200).send(
                    {
                        message: "Event updated successfully",
                        event: event
                    }
                );
            }
        )
    }
    catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        });
    }


});

module.exports = router
