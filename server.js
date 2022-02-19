const Express = require("express");
const app = Express();

app.use(Express.json());

app.get("/", (request, response) => {
    response.status(200).send("Welcome to Amrita Events API");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
