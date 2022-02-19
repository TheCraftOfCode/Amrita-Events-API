const Express = require("express");
const router = Express.Router();
const Events = require("../models/events_model");
VerifyAuth = require("../middleware/verify_auth", require)

router.post("/", VerifyAuth(["admin", "super_admin", "user"], true), async (request, response) => {
    Events.find({}, function (err, data) {
        if (!err) {
            return response.status(200).send(data)
        } else {
            return response.status(500).send(err)
        }
    });
})

module.exports = router
