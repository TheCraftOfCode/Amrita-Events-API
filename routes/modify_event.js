const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const moment = require("moment");
const notification = require("../utils/notification");
const schedule = require("node-schedule");
VerifyAuth = require("../middleware/verify_auth")

router.post("/", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    //modify event data
    let { eventName, day, month, year, timeHour, timeMinute, location, description, eventType, eventOver } = request.body;

    //validate eventName
    if (!eventName) {
        return response.status(400).send({
            message: "Please provide event name"
        });
    }

    //validate date
    if (!day) {
        return response.status(400).send({
            message: "Please provide day"
        });
    }

    if (!month) {
        return response.status(400).send({
            message: "Please provide month"
        });
    }

    if (!year) {
        return response.status(400).send({
            message: "Please provide month"
        });
    }


    //validate time
    if (!timeHour) {
        return response.status(400).send({
            message: "Please provide hour"
        });
    }

    if (!timeMinute) {
        return response.status(400).send({
            message: "Please provide minute"
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

        let date = new Date(year, month, day, timeHour, timeMinute, 0);


        event.eventName = eventName;
        event.date = date;
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
                notification(eventName, `Event, ${eventName} of type ${eventType} has been modified!\nCheck it out for more details`, {}, "main");

                const myJob = schedule.scheduledJobs[event.id];

                console.log(myJob)
                if(myJob !== undefined) myJob.cancel()

                schedule.scheduleJob(event.id, date, function(){
                    console.log('The world is going to end today.');
                    //TODO: Send notification from here
                    // notification(eventName, `A new event, ${eventName} of type ${eventType} has been added!\nCheck it out for more details`, {}, "main");

                });

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
