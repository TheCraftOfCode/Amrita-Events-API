const jwt = require("jsonwebtoken");
const {User} = require("../models/user_model");
const {Admin} = require("../models/admin_model"); 

module.exports = function (roles, allowMiddleware) {
    return async function (request, response, next) {

        console.log("Verifying token");
        if (!allowMiddleware) return next();

        const receiveToken = request.header("user-auth-token");
        if (!receiveToken) {
            return response
                .status(412)
                .send("Token not found, please attach token and try again");
        }
        try {
            request.user = jwt.verify(receiveToken, "mysecretkey");
            const userRole = request.user.role;
            const id = request.user._id

            if (!userRole) {
                return response.status(403).send("You are not authorised to perform this action");
            } else if (roles.includes(userRole)) {
                const CheckUser = await User.findById(id);
                const CheckAdmin = await Admin.findById(id);
                let user = CheckUser || CheckAdmin;
                
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
