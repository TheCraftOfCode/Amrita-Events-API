const express = require("express");
const router = express.Router();
const verifyAuth = require("../middleware/verify_auth");

module.exports = router.post("/", verifyAuth(["admin", "super_admin", "user"], true), (req, res) => {
    res.status(200).send({
        message: "Success"
    });
}
);
