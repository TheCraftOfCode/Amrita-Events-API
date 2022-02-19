const Express = require("express");
const app = Express();
const register = require("./routes/register");
const login = require("./routes/login");
const adminRegister = require("./routes/admin_register");
const adminLogin = require("./routes/admin_login");
const verifyToken = require("./routes/verify_token");
const changePassword = require("./routes/change_password");
const addEvents = require("./routes/add_events");
const getEvents = require("./routes/get_events");
const modifyEvents = require("./routes/modify_event");
const deleteEvents = require("./routes/delete_event");
const rsvpEvents = require("./routes/rsvp_events");
const getRsvpEvents = require("./routes/get_rsvp_events");


require("./config/database_connection")();

app.use(Express.json());

app.get("/", (request, response) => {
    response.status(200).send("Welcome to Amrita Events API");
});

app.use("/register", register);
app.use("/admin_register", adminRegister);
app.use("/login", login);
app.use("/admin_login", adminLogin);
app.use("/verify_token", verifyToken);
app.use("/change_password", changePassword);

app.use("/add_events", addEvents);
app.use("/get_events", getEvents);
app.use("/modify_event", modifyEvents);
app.use("/delete_event", deleteEvents);
app.use("/rsvp_events", rsvpEvents);
app.use("/get_rsvp_events", getRsvpEvents);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
