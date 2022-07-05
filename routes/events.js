const express = require("express");
const router = express.Router();
VerifyAuth = require("../middleware/verify_auth")
const Events = require("../models/events_model");
const schedule = require('node-schedule');
const notification = require("../utils/notification")

//Add event
router.post("/addEvent", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

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
            schedule.scheduleJob(event.id, date, function () {
                notification(eventName, `The event, ${eventName} of type ${eventType} has been started!\nCheck it out for more details`, {}, event.id);
            });

            return response.status(200).send({
                message: "Event saved successfully",
                event: event
            });
        }
    )

});

//Modify event
router.post("/modifyEvent", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    //modify event data
    let {eventName, day, month, year, timeHour, timeMinute, location, description, eventType, eventOver} = request.body;

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
                if (myJob !== undefined) myJob.cancel()

                schedule.scheduleJob(event.id, date, function () {
                    notification(eventName, `THe event, ${eventName} of type ${eventType} has been started!\nCheck it out for more details`, {}, event.id);

                });

                return response.status(200).send(
                    {
                        message: "Event updated successfully",
                        event: event
                    }
                );
            }
        )
    } catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        });
    }


});

//get event
router.post("/getEvents", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    Events.find({}).lean().exec(function (err, data) {
        console.log(data)
        data.forEach(function (event) {
            let eventDate = event.date
            event.date = eventDate.toLocaleDateString();
            event.time = eventDate.toLocaleTimeString();
        })
        if (!err) {
            return response.status(200).send({
                message: "Events fetched successfully",
                data: data
            })
        } else {
            return response.status(500).send({
                message: "Failed to fetch events",
                error: err
            })
        }
    });
})

//delete event
router.post("/deleteEvent", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    try {
        let id = request.body.id

        const event = await Events.findById(id);

        if (event) {
            event.remove().then(r => {
                console.log(r)
                return response.status(200).send(
                    {
                        message: "Event deleted successfully"
                    }
                )
            });

        } else {
            return response.status(400).send(
                {
                    message: "Event not found"
                }
            )
        }
    } catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        })
    }

})

module.exports = router
