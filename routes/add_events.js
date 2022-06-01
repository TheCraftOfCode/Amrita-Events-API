const Express = require("express");
const router = Express.Router();

//TODO: Notify on FCM on every new events added
VerifyAuth = require("../middleware/verify_auth")
const Events = require("../models/events_model");
const schedule = require('node-schedule');
const notification = require("../utils/notification")

router.post("/", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    //get eventName date time location description countOfRSVP eventType
    let {eventName, day, month, year, timeHour, timeMinute, location, description, eventType} = request.body;


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

    //check if eventType is valid
    if (!["CULTURAL", "TECHNICAL", "SPIRITUAL"].includes(eventType)) {
        return response.status(400).send({
            message: "Please provide valid event type"
        });
    }

    let date = new Date(year, month, day, timeHour, timeMinute, 0);
    console.log(date.toString(), "FINAL DATE")
    //save event to database
    const event = new Events({
        eventName: eventName,
        date: date,
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
            notification(eventName, `A new event, ${eventName} of type ${eventType} has been added!\nCheck it out for more details`, {}, "main");

            console.log(date.toString(), event.date.toString())
            schedule.scheduleJob(event.id, date, function(){
                //TODO: Send notification from here

                // notification(eventName, `A new event, ${eventName} of type ${eventType} has been added!\nCheck it out for more details`, {}, "main");

            });

            return response.status(200).send({
                message: "Event saved successfully",
                event: event
            });
        }
    )

});

module.exports = router
