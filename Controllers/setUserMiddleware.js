var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
var jwt = require('jsonwebtoken');
var BlogModel = models.blogs;
var UserRole = models.UserRole;
var UserModel = models.User;
router.use(makeViewBag, syncUserRoles, findUser);

function makeViewBag(req, res, next) {
    req["ViewBag"] = {};
    req["ViewBag"]["style"] = env === "production" ? true : false;
    req["ViewBag"]["title"] = "Diggity's";
    next();
}

function syncUserRoles(req, res, next) {
    var UserRoleModelSync = UserRole.sync();
    UserRoleModelSync.then(() => { next() });
    UserRoleModelSync.catch((error) => { res.send(error) });
}
function findUser(req, res, next) {
    var userid = req.decoded.User.userid
    models.UserRole.findOne({
        where: {
            user_id: userid
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
    })
        .then(function (users) {
            if (users == null) {
                req["Users"] = null;
                req["User"] = null;
                next();
            } else {
                let user_obj = users.User.dataValues;
                req["Users"] = user_obj;
                req["User"] = user_obj;
                req.ViewBag["User"] = user_obj;
                if (user_obj.firstname !== req.decoded.User.firstname) {
                    res.clearCookie("token");
                    res.render("Manage/loginPartial")
                } else {
                    next();
                }
            }
        })
        .catch(function (error) {
            res.status(500).render("error", { error });
        });
}

module.exports = router;