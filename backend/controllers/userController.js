const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (req, res, next) => {
    bcrypt.hash(req.body.password, 10, )
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            user.save().then(result => {
                res.status(201).json({
                    message: 'User created successfuly',
                    result: result
                });
            }).catch(err => {
                res.status(500).json({
                    message: "Invalid authetication credentials!", 
                    reason: "Email has already been registered"
                });
            });
        });
};

exports.userLogin = (req, res, next) => {
    let errMessage = "Invalid authetication credentials!"; 
    let fetchedUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: errMessage,
                    reason: "User was not found"
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(doPasswordMatch => {
            if (res.headersSent) {
                return res;
            }
            if (!doPasswordMatch) {
                return res.status(401).json({
                    message: errMessage,
                    reason: "Incorrect password"
                });
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id }, 
                process.env.JWT_KEY, 
                { expiresIn: '1h' }
            );
            res.status(200).json({
                message: errMessage,
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
            });
        })
        .catch(err => {
            return res.status(401).json({
                message: "Authetication failed"
            });
        });
};