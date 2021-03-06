const express = require("express");
const router = express.Router();
VerifyAuth = require("../middleware/verify_auth")
const Events = require("../models/events_model");
const schedule = require('node-schedule');
const notification = require("../utils/notification")
const {User} = require("../models/user_model");
const {broadcast} = require("../config/websocket");

//Add event
router.post("/addEvent", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    //get eventName date time location description countOfRSVP eventType
    let {
        eventName,
        day,
        month,
        year,
        timeHour,
        timeMinute,
        host,
        posterUrl,
        location,
        description,
        eventType
    } = request.body;


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

    if (!host) {
        return response.status(400).send({
            message: "Please provide host of this event"
        });
    }

    if (posterUrl) {
        try {
            new URL(posterUrl);
        } catch (error) {
            return response.status(400).send({
                message: "Poster url is not valid"
            });
        }
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
    //save event to database
    const event = new Events({
        eventName: eventName,
        date: date,
        location: location,
        posterUrl: posterUrl,
        host: host,
        description: description,
        eventType: eventType,
    });

    event.save(
        function (err, event) {
            if (err) {
                return response.status(400).send({
                    message: "Error saving event",
                    err: err
                });
            }

            const eventObject = event.toObject();
            let eventDate = eventObject.date
            eventObject.dateUnparsed = eventDate
            eventObject.date = eventDate.toLocaleDateString();
            eventObject.time = eventDate.toLocaleTimeString();
            eventObject.rsvp = false
            eventObject.starred = false
            broadcast(JSON.stringify({
                message: `A new event of name ${eventName} has been added`,
                type: "event_add",
                data: eventObject
            }))

            notification(eventName, `A new event, ${eventName} of type ${eventType} has been added!\nCheck it out for more details`, {}, "main");

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
    let {
        eventName,
        day,
        month,
        year,
        timeHour,
        timeMinute,
        host,
        posterUrl,
        location,
        description,
        eventType,
        eventOver
    } = request.body;

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

    if (!host) {
        return response.status(400).send({
            message: "Please provide host of this event"
        });
    }

    if (posterUrl) {
        try {
            new URL(posterUrl);
        } catch (error) {
            return response.status(400).send({
                message: "Poster url is not valid"
            });
        }
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
        event.posterUrl = posterUrl;
        event.host = host;

        await event.save(
            (err, event) => {
                if (err) {
                    return response.status(500).send({
                        message: err.message || "Some error occurred while updating the event."
                    });
                }
                const eventObject = event.toObject();
                let eventDate = eventObject.date
                eventObject.dateUnparsed = eventDate
                eventObject.date = eventDate.toLocaleDateString();
                eventObject.time = eventDate.toLocaleTimeString();
                eventObject.rsvp = false
                eventObject.starred = false
                broadcast(JSON.stringify({
                    message: `An event of name ${eventName} has been modified`,
                    type: "event_modify",
                    data: eventObject
                }))
                notification(eventName, `Event, ${eventName} of type ${eventType} has been modified!\nCheck it out for more details`, {}, "main");

                const myJob = schedule.scheduledJobs[event.id];

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
    let user = await User.findById(request.user._id)
    Events.find({}).select("-listOfRSVPUsers -countOfRSVP -__v").lean().exec(function (err, data) {
        data.forEach(function (event) {
            let eventDate = event.date
            event.dateUnparsed = eventDate
            event.date = eventDate.toLocaleDateString();
            event.time = eventDate.toLocaleTimeString();
            event.rsvp = user.listOfRSVPEvents.includes(event._id)
            event.starred = user.listOfStarredEvents.includes(event._id)

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

router.post("/starEvent", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    //get user eventID from request
    let {eventId} = request.body;
    let userID = request.user._id

    //check if eventID is not empty
    if (!eventId) {
        return response.status(400).send({
            message: "Please provide event eventID"
        });
    }

    //find event by eventID
    try {
        const user = await User.findById(userID);

        if (!user) {
            return response.status(400).send({
                message: "User not found"
            });
        }
        //update listOfRSVPEvents in user

        if (user.listOfStarredEvents.includes(eventId)) {
            return response.status(400).send({
                message: "User already starred this event"
            });
        }
        //check if listOfRSVPEvents is undefined
        if (!user.listOfStarredEvents) {
            user.listOfStarredEvents = [];
        }
        if (!user.countOfStarredEvent) {
            user.countOfStarredEvent = 0
        }
        user.countOfStarredEvent += 1
        user.listOfStarredEvents.push(eventId);
        user.save(
            async (err, _) => {
                if (err) {
                    return response.status(400).send({
                        message: "Error updating starred events",
                        error: err.message || "Something went wrong"
                    })
                }
                return response.status(200).send({
                    message: "Starred event added to server",
                });
            }
        );

    } catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        })
    }
})

router.post("/removeStarredEvent", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    //get user eventID from request
    let {eventId} = request.body;
    let userID = request.user._id

    //check if eventID is not empty
    if (!eventId) {
        return response.status(400).send({
            message: "Please provide event eventID"
        });
    }

    //find event by eventID
    try {
        const user = await User.findById(userID);

        if (!user) {
            return response.status(400).send({
                message: "User not found"
            });
        }
        //update listOfRSVPEvents in user

        if (!user.listOfStarredEvents.includes(eventId)) {
            return response.status(400).send({
                message: "Event has not been starred"
            });
        }
        //check if listOfRSVPEvents is undefined
        if (!user.listOfStarredEvents) {
            user.listOfStarredEvents = [];
        }
        if (!user.countOfStarredEvent) {
            user.countOfStarredEvent = 0
        } else {
            user.countOfStarredEvent -= 1
        }
        user.listOfStarredEvents = user.listOfStarredEvents.filter(function (value, index, arr) {
            return value !== eventId;
        });

        user.save(
            async (err, _) => {
                if (err) {
                    return response.status(400).send({
                        message: "Error updating starred events",
                        error: err.message || "Something went wrong"
                    })
                }
                return response.status(200).send({
                    message: "Starred event removed from server",
                });
            }
        );

    } catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        })
    }
})

//delete event
router.post("/deleteEvent", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

    try {
        let id = request.body.id

        const event = await Events.findById(id);

        if (event) {
            event.remove().then(r => {
                broadcast(JSON.stringify({
                    message: `An event of name ${event.eventName} has been deleted`,
                    type: "event_delete",
                    data: event
                }))
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

router.post("/pageViewed", VerifyAuth(["user", "admin", "super_admin"], true), async (request, response) => {

    //countOfEventViewed

    try {
        let id = request.body.id

        const event = await Events.findById(id);

        if (event) {

            if (!event.countOfEventViewed) {
                event.countOfEventViewed = 1
            } else {
                event.countOfEventViewed += 1
            }

            event.save(
                async (err, _) => {
                    if (err) {
                        return response.status(400).send({
                            message: "Error updating events",
                            error: err.message || "Something went wrong"
                        })
                    }
                    return response.status(200).send({
                        message: "Incremented visit count",
                    });
                }
            );

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
