const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const morgan = require('morgan')
require("dotenv").config();

//TODO: Check gmail password, AUTH error while sending email
//TODO: Modify mail modules to send generic mails and send mail to users for
//TODO: Add module for forgot password
//TODO: Test firebase notification
//TODO: Add new module to push notifications as an admin

//Import for all routes
const adminManagement = require("./routes/admin_management")
const eventManagement = require("./routes/events")
const getNotifications = require("./routes/manage_notifications");
const rsvp = require("./routes/rsvp")
const userManagement = require("./routes/user_management")

//firebase configuration
let admin = require("firebase-admin");
const serviceAccount = require("./config/key.json");
const {socket, getWSS} = require("./config/websocket");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//database setup
require("./config/database_connection")();
socket(server)

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))


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

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//websocket config


