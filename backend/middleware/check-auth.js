const jwt = require("jsonwebtoken");
const secret = require("../../server-secret");

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, secret.SECRET);
        req.userData = { email: decodedToken.email, userId: decodedToken.userId };
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Authorization failed",
            reason: "No token attached or invalid token"
        });
    }
    
};