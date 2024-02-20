const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = require("../../server-secret");

const User = require("../models/user");

const router = express.Router();

router.post("/signup", (req, res, next) => {
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
                    error: err
                });
            });
        });
});

router.post("/login", (req, res, next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: "Authetication failed",
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
                    message: "Authetication failed",
                    reason: "Incorrect password"
                });
            }
            const token = jwt.sign(
                { email: fetchedUser.email, userId: fetchedUser._id }, 
                secret.SECRET, 
                { expiresIn: '1h' }
            );
            res.status(200).json({
                message: "Authentication success",
                token: token,
                expiresIn: 3600,
                userId: fetchedUser._id
            });
        })
        .catch(err => {
            return res.status(401).json({
                message: "Authetication failed",
                reason: err
            });
        });
});

module.exports = router;
