var express = require('express');
var router = express.Router();
var models = require('../Models');
var UserModel = models.User;
var pass = require('password-hash-and-salt');
var jwt = require('jsonwebtoken');


router.post('/authenticate', function (req, res, next) { // find user
    UserModel.sync().then(function () {
        UserModel.findOne({ where: { email: req.body.email } })
            .then(function (responce) {
                req["pass"] = req.body.password;
                req["userResponce"] = responce;
                next();
            })
            .catch(function (error) {
                const err = {
                    error: true,
                    message: "Could not find user",
                    error
                }
                res.status(500).send(err);
                res.end();
            })
    });
    return false;
}, function (req, res, next) { //testing password
    const secret = req.userResponce.hash;
    pass(req.body.password).verifyAgainst(secret, function (error, verified) {// Verifying a hash 
        if (error)
            throw new Error('Something went wrong!');
        if (!verified) {
            res.status(500).send(false);
        } else {
            req.userResponce.hash = null;
            var token = jwt.sign(req["userResponce"].dataValues, process.env.JWT_SK);
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
            req.body = {
                success: true,
                message: 'Enjoy your token!',
                token: token
            };
            next();
        }
    });
});

module.exports = router;