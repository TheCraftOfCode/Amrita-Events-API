const Express = require("express");
const app = Express();

//TODO: Check gmail password, AUTH error while sending email
//TODO: Modify mail modules to send generic mails and send mail to users for
//TODO: Add module for forgot password
//TODO: Test firebase notification

require("dotenv").config();

//Import for all routes
const adminManagement = require("./routes/admin_management")
const eventManagement = require("./routes/events")
const getNotifications = require("./routes/get_notifications");
const rsvp = require("./routes/rsvp")
const userManagement = require("./routes/user_management")

let admin = require("firebase-admin");
const serviceAccount = require("./config/key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

require("./config/database_connection")();

app.use(Express.json());

app.get("/", (request, response) => {
    response.status(200).send("Welcome to Amrita Events API");
});

//Routes used
app.use("/admin", adminManagement)
app.use("/event", eventManagement)
app.use("/notification", getNotifications)
app.use("/rsvp", rsvp)
app.use("/user", userManagement)

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
