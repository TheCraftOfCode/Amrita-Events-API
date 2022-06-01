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
const deleteSelf = require("./routes/delete_self");
const deleteAdmin = require("./routes/delete_admins");
const deleteUser = require("./routes/delete_users");
const getAllUsers = require("./routes/get_all_users");
const getRsvpUsers = require("./routes/get_rsvp_users");
const changePhoneNumber = require("./routes/change_phone_number");
const getNotifications = require("./routes/get_notifications");

let admin = require("firebase-admin");
const serviceAccount = require("./config/key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

//TODO: Add route to delete users as admin, delete self, password reset and get list of all users when admin

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
app.use("/change_phone_number", changePhoneNumber);
app.use("/add_events", addEvents);
app.use("/get_events", getEvents);
app.use("/modify_event", modifyEvents);
app.use("/delete_event", deleteEvents);
app.use("/rsvp_events", rsvpEvents);
app.use("/get_rsvp_events", getRsvpEvents);
app.use("/delete_self", deleteSelf);
app.use("/delete_admin", deleteAdmin);
app.use("/delete_user", deleteUser);
app.use("/get_all_users", getAllUsers);
app.use("/get_rsvp_users", getRsvpUsers);
app.use("/get_notifications", getNotifications);


const PORT = process.env.PORT || 8001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
