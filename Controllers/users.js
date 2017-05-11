var express = require('express');
var router = express.Router();
var models = require('../Models');
var UserModel = models.User;
var UserRoleModel = models.UserRole;
var pass = require('password-hash-and-salt');
var jwt = require('jsonwebtoken');



//get views
router.get('/signup', function (req, res, next) {
    let env = process.env.ENV;
    let styleBool = env === "production" ? true : false;
    req.ViewBag = {
        title: "Sign Up!",
        style: styleBool
    }
    res.render('Manage/signup', req,
        function (err, html) {
            if (err) {
                err.status = 500;
                console.log(err);
                throw err
            }
            else {
                res.send(html);
            }
        }
    );
});

router.get('/login', function (req, res, next) {
    let env = process.env.ENV;
    let styleBool = env === "production" ? true : false;
    req.ViewBag = {
        title: "Log In!",
        style: styleBool
    }
    res.render('Manage/login', req,
        function (err, html) {
            if (err) {
                err.status = 500;
                console.log(err);
                throw err
            }
            else {
                res.send(html);
            }
        }
    );
});

router.get('/logout', function (req, res, next) {
    req.session.user = null;
    res.redirect("/");
});


//actions
//Posts
router.post('/addUser',
    function (req, res, next) { //collecting / setting data
        const data = req.body;
        const firstname = data.firstname;
        const lastname = data.lastname;
        const email = data.email;
        const password = data.password;
        let modelObj = {
            firstname,
            lastname,
            email,
            hash: password
        }
        req["modelObj"] = modelObj;
        next();
        return false;
    }, function (req, res, next) { //making password hash
        const secret = req.modelObj.hash;
        pass(secret).hash(function (error, hash) {
            if (error)
                throw new Error("Something went wrong!");
            req.modelObj.hash = hash;
            next();
        });
        return false;
    }, function (req, res, next) { //testing hash
        const secret = req.modelObj.hash;
        console.log("SECRET", secret)
        pass(req.body.password).verifyAgainst(secret, function (error, verified) {
            if (error)
                throw new Error('Something went wrong!');
            if (!verified) {
                res.status(500).send(false);
            } else {
                console.log("VERFIY", verified);
                next()
            }
        });
        return false;
    }, function (req, res, next) { //make user
        UserModel.sync().then(function () {

            UserModel.create(req.modelObj)
                .then(function (responce) {
                    req["userResponce"] = responce;
                    next();
                })
                .catch(function (error) {
                    const err = {
                        error: true,
                        message: "Could not create user model",
                        error
                    }
                    res.status(500).send(err);
                    res.end();
                })
        });
        return false;
    }, function (req, res, next) { //make user role
        let user_id = req.userResponce.dataValues.userid;
        UserRoleModel.sync().then(function () {
            UserRoleModel.create({ user_id: user_id, role_id: 2 })
                .then(function (responce) {
                    res.status(200).send(true);
                    next();
                })
                .catch(function (error) {
                    const err = {
                        error: true,
                        message: "Could not create user role model",
                        error
                    }
                    res.status(500).send(err);
                    next();
                })
        });
        return false;
    });









module.exports = router;

