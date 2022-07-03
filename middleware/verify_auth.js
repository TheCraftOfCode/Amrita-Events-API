const jwt = require("jsonwebtoken");
const {User} = require("../models/user_model");
require("dotenv").config();

module.exports = function (roles, allowMiddleware) {
    return async function (request, response, next) {

        if (!allowMiddleware) return next();

        const receiveToken = request.header("user-auth-token");
        if (!receiveToken) {
            return response
                .status(412)
                .send("Token not found, please attach token and try again");
        }
        try {
            //TODO: Add JWT key instead of fixed key
            request.user = jwt.verify(receiveToken, process.env.JWT_SECRET_KEY);
            const userRole = request.user.role;
            const id = request.user._id

            if (!userRole) {
                return response.status(403).send("You are not authorised to perform this action");
            } else if (roles.includes(userRole)) {
                //userId: userId,
                const user = await User.findById(id);

                if (!user)
                    return response.status(412).send("User not found");
                else {
                    if (request.user.verificationKey !== user.verificationKey && request.user.verificationKey !== undefined) {
                        return response.status(412).send("Invalid Token");
                    } else {
                        next();
                    }
                }
            } else {
                return response.status(412).send("You are not authorised to perform this action");
            }
        } catch (error) {
            console.log(error)
            response.status(412).send("Couldn't validate token, try signing in again");
        }
    }
}
