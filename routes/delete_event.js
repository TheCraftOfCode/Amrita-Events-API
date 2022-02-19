const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
const mongoose = require("mongoose");
VerifyAuth = require("../middleware/verify_auth")

router.post("/", VerifyAuth(["admin", "super_admin"], true), async (request, response) => {

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
    }
    catch (e) {
        return response.status(400).send({
            message: "Error updating event",
            error: e.message || "Something went wrong"
        })
    }

})

module.exports = router


