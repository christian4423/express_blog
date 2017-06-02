var express = require('express');
var router = express.Router();
var models = require('../Models');
var UserModel = models.User;
var UserRoleModel = models.UserRole;
var BlogModel = models.blogs;
function setEnvVarsProfileGet(req, res, next) {
    req.ViewBag["title"] = "Profile";
    next();
}
function makeFindUserObj_Other(req, res, next) {
    const User = req.params.id;
    const UserRoleWhere = { where: { user_id: User } }
    const UserRoleInclude = [
        {
            model: models.User,
            as: "User"
        },
        {
            model: models.Role,
            as: "Role"
        }
    ]
    const UserRoleFindOneObj = {
        UserRoleWhere,
        include: UserRoleInclude
    }
    req["user_role_find_obj"] = UserRoleFindOneObj;
    next();
}
function findUser_other(req, res, next) {
    const UserRoleFindOneObj = req["user_role_find_obj"];
    const UserRoleFindOne = models.UserRole.findOne({ where: { user_id: req.params.id }, include: UserRoleFindOneObj.include });
    UserRoleFindOne.then((user) => {
        if (user == null) {
            const err = {
                error: true,
                message: "User Profile Not Found.",
                err
            }
            res.status(500).send(err);
        } else {
            req["User"] = user.User.dataValues;
            next();
        }
    })
    UserRoleFindOne.catch((error) => {
        const err = {
            error: true,
            message: "Could not create user model",
            error
        }
        res.status(500).send(err);
    })
}
function findBlogs(req, res, next) {
    const UserRoleFindOneObj = req["user_role_find_obj"];
    const UserRoleFindOne = models.UserRole.findOne({ where: { user_id: req.params.id }, include: UserRoleFindOneObj.include });
    UserRoleFindOne.then((user) => {
        if (user == null) {
            const err = {
                error: true,
                message: "User Profile Not Found.",
                err
            }
            res.status(500).send(err);
        } else {
            req["User"] = user.User.dataValues;
            next();
        }
    })
    UserRoleFindOne.catch((error) => {
        const err = {
            error: true,
            message: "Could not create user model",
            error
        }
        res.status(500).send(err);
    })
}

// function setEnvVarsProfileGet(req, res, next) {
//     req.ViewBag["title"] = "Profile";
//     next();
// }
// function makeFindUserObj_Other(req, res, next) {
//     const User = req.params.id;
//     const UserRoleWhere = { where: { user_id: User } }
//     const UserRoleInclude = [
//         {
//             model: models.User,
//             as: "User"
//         },
//         {
//             model: models.Role,
//             as: "Role"
//         }
//     ]
//     const UserRoleFindOneObj = {
//         UserRoleWhere,
//         include: UserRoleInclude
//     }
//     req["user_role_find_obj"] = UserRoleFindOneObj;
//     next();
// }
// function findUser_other(req, res, next) {
//     const UserRoleFindOneObj = req["user_role_find_obj"];
//     const UserRoleFindOne = models.UserRole.findOne({ where: { user_id: req.params.id }, include: UserRoleFindOneObj.include });
//     UserRoleFindOne.then((user) => {
//         if (user == null) {
//             const err = {
//                 error: true,
//                 message: "User Profile Not Found.",
//                 err
//             }
//             res.status(500).send(err);
//         } else {
//             req["User"] = user;
//             next();
//         }
//     })
//     UserRoleFindOne.catch((error) => {
//         const err = {
//             error: true,
//             message: "Could not create user model",
//             error
//         }
//         res.status(500).send(err);
//     })
// }
function get_blogs(req, res, next) {
    const BMFONE = BlogModel.findAll({ where: { user_id: req.params.id }, order: '"updatedAt" DESC' });
    BMFONE.then((blogs) => {
        if (blogs == null) {
            res.send({ status: 404, message: "Could not find blog." })
        } else {
            req.ViewBag["blogs"] = [];
            for (let blog of blogs) {
                req.ViewBag["blogs"].push(blog.dataValues);
            }
            next();
        }
    });
    BMFONE.catch((error) => { 
        res.send(error) 
    });
}


function syncUsers(req, res, next) {
    const UserModelSync = UserModel.sync();
    UserModelSync.then(() => { next() });
    UserModelSync.catch((error) => { res.send(error) })
}
function findUsers(req, res, next) {
    const blogs = req.ViewBag.blogs;
    if (blogs.length <= 0) {
        next();
    }
    var user = req.User;
    let fn = user.firstname;
    let ln = user.lastname;
    let index = 0;
    for (let blog of blogs) {
        req.ViewBag.blogs[index]["profile_pic"] = user.profile_pic;
        req.ViewBag.blogs[index]["user_added"] = `${fn} ${ln} `;
        index++;
        if (index == (blogs.length)) {
            next();
        }
    }
}
function blogTagsToArr(req, res, next) {
    const blogs = req.ViewBag.blogs;
    if (blogs.length <= 0) {
        next();
    }
    let index = 0;
    for (let blog of blogs) {
        let tags = blog.tags;
        var tag_arr = tags.split(" ");
        req.ViewBag.blogs[index]["tags"] = tag_arr;
        index++;
    }
    next();
}
function dateToStamp(req, res, next) {
    const blogs = req.ViewBag.blogs;
    if (blogs.length <= 0) {
        next();
    }
    let index = 0;
    for (let blog of blogs) {
        let date = blog.user_updated;
        let time_ago = timeSince(date);
        req.ViewBag.blogs[index]["time_ago"] = time_ago;
        index++;
    }
    next();
}

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " yrs";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " hrs";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hrs";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " min";
    }
    interval = Math.floor(seconds);
    if (interval < 15) {
        return "now"
    }
    return Math.floor(seconds) + " sec";
}
function renderProfile(req, res) {
    res.render('Account/profile', req, (err, html) => { err != null ? res.send(err) : res.send(html) });
}
router.get('/view/:id', setEnvVarsProfileGet, makeFindUserObj_Other, findUser_other, get_blogs, findUsers, blogTagsToArr, dateToStamp, renderProfile);








//router.get('/view/:id', setEnvVarsProfileGet, makeFindUserObj_Other, findUser_other, renderProfile);

module.exports = router;

