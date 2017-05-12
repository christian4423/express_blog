var express = require('express');
var router = express.Router();
var models = require('../Models');
var UserModel = models.User;
var pass = require('password-hash-and-salt');
var jwt = require('jsonwebtoken');
var RoleModel = models.Role;
var UserRoleModel = models.UserRole;

/*
{
            where: {
                user_id: userid
            },

        }

 */
router.post('/authenticate', function (req, res, next) { // find user
    UserModel.sync().then(function () {
        UserModel.findOne(
            {
                where: { email: req.body.email }
            })
            .then(function (responce) {
                return responce;
            }).then(function (userResponce) {
                var user = userResponce.dataValues;
                var id = user.userid;
                models.UserRole.findOne({
                    where: {
                        user_id: id
                    },
                    include: [
                        {
                            model: models.User,
                            as: "User"
                        },
                        {
                            model: models.Role,
                            as: "Role"
                        }
                    ]
                }).then(function (responce) {
                    req["pass"] = req.body.password;

                    var obj = {
                        User: responce.User.dataValues,
                        Role: responce.Role.role
                    }



                    req["userResponce"] = obj;
                    next();
                }).catch(function () {
                    res.status(500).send(error);
                })
            })
            .catch(function (error) {
                res.status(500).send(error);
            })
    });
    return false;
}, function (req, res, next) { //testing password
    const secret = req.userResponce.User.hash;
    pass(req.body.password).verifyAgainst(secret, function (error, verified) {// Verifying a hash 
        if (error)
            throw new Error('Something went wrong!');
        if (!verified) {
            res.status(500).send(false);
        } else {
            req.userResponce.hash = null;
            var token = jwt.sign(req["userResponce"], process.env.JWT_SK);
            res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
            });
        }
    });
});

module.exports = router;