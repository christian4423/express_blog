var express = require('express');
var router = express.Router();
var models = require('../Models');
var RolesModel = models.Role;
var UserModel = models.User;
var UserRoleModel = models.UserRole;
var BlogModel = models.blogs;
var pass = require('password-hash-and-salt');

function initDB(req, res, next) {
    next();
}
function delete_roles(req, res, next) {
    console.log("Deleting tables");
    RolesModel.sync().then(function () {
        RolesModel.drop({
            cascade: true,
            benchmark: true
        }).then(function () {
            console.log("...Roles Deleted");
            next();
        }).catch(function () {
            next(responce.message);
        });
    }).catch(function (res) {
        next(responce.message);
    });
}
function delete_users(req, res, next) {
    UserModel.sync().then(function () {
        UserModel.drop({
            cascade: true,
            benchmark: true
        }).then(function () {
            console.log("...Users Deleted");
            next();
        }).catch(function () {
            next(responce.message);
        });
    }).catch(function (responce) {
        next(responce.message);
    });
}
function delete_blogs(req, res, next) {
    BlogModel.sync().then(function () {
        BlogModel.drop({
            benchmark: true
        }).then(function () {
            console.log("...Blogs Deleted");
            next();
        }).catch(function (responce) {
            next(responce.message);
        });
    }).catch(function (responce) {
        next(responce.message);
    });
}
function delete_user_roles(req, res, next) {
    UserRoleModel.sync().then(function () {
        UserRoleModel.drop({
            cascade: true,
            benchmark: true
        }).then(function () {
            console.log("...User Roles Deleted");
            console.log("All Tables Deleted");
            next();
        }).catch(function (responce) {
            next(responce.message);
        });
    }).catch(function (responce) {
        next(responce.message);
    });
}

function add_roles(req, res, next) {
    console.log("Adding Table Data");
    RolesModel.sync().then(function () {
        RolesModel.bulkCreate([
            { roleid: 1, role: "Admin" },
            { roleid: 2, role: "User" },
            { roleid: 3, role: "Guest" },
            { roleid: 4, role: "Unauthorized" }
        ], {
                benchmark: false,
            })
            .then(function (responce) {
                console.log("...In Roles Table");
                console.log("......All Roles created");
                next();
            })
            .catch(function (error) {
                next(responce.message);
            });
    }).catch(function (responce) {
        next(responce.message);
    });
}
function create_hash(req, res, next) {
    const secret = "09ca37273b5c1dacd2ea";
    console.log("...In Users Table");
    console.log("......Generating Super User Hash");
    pass(secret).hash(function (error, hash) {
        if (error) {
            next(error.message);
        }
        req["hash"] = hash;
        console.log("......Super User Hash Generated");
        next();
    });
}

function create_super_user(req, res, next) {
    const hash = req["hash"];
    console.log("......Creating Super User");
    UserModel.sync().then(function () {
        UserModel.create({ firstname: "Super", lastname: "User", email: "su@diggitys.com", hash: hash }, {
            benchmark: false,
        })
            .then(function (responce) {
                console.log("......Creating Super Created");
                next();
            })
            .catch(function (error) {
                next(error.message);
            });
    }).catch(function (responce) {
        next(responce.message);
    });
}
function link_su_to_role(req, res, next) {
    console.log("...In UserRoles");
    console.log("......Setting Super User as Admin");
    UserRoleModel.sync().then(function () {
        UserRoleModel.create({ user_id: 1, role_id: 1 }, {
            benchmark: false,
        })
            .then(function (responce) {
                console.log("......Super User is now admin");
                next();
            })
            .catch(function (error) {
                next(responce.message);
            });
    }).catch(function (responce) {
        next(responce.message);
    });
}

function display(req, res, next) {
    console.log("+---------------------------------+");
    console.log("|             Finished            |");
    console.log("+---------------------------------+");
    console.log("| Email:   | su@diggitys.com      |");
    console.log("+----------+----------------------+");
    console.log("| Password | 09ca37273b5c1dacd2ea |");
    console.log("+----------+----------------------+");
    next();
}

function end(req, res) {
    res.clearCookie("token");
    res.redirect("/");
}


router.get('/', initDB, delete_roles, delete_users, delete_user_roles, delete_blogs, add_roles, create_hash, create_super_user, link_su_to_role, display, end);
module.exports = router;