const Express = require("express");
const app = Express();
const register = require("./routes/register");
const login = require("./routes/login");
//import DatabaseConnection
require("./config/database_connection")();

app.use(Express.json());

app.get("/", (request, response) => {
    response.status(200).send("Welcome to Amrita Events API");
});

app.use("/register", register);
app.use("/login", login);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
