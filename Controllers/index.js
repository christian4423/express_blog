var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
var jwt = require('jsonwebtoken');
var BlogModel = models.blogs;
var UserRole = models.UserRole;
var UserModel = models.User;

function setProductsEnviormentVars(req, res, next) {
    req["ViewBag"] = {
        style: env === "production" ? true : false,
        title: "Products"
    };
    next();
    return;
};
function productsView(req, res, next) {
    req['data'] = {
        ViewBag: req.ViewBag,
        Model: null
    };
    req['renderInfo'] = {
        view: 'products',
        status: 200
    };
    next();
    return;
};




function setHomeEnviormentVars(req, res, next) {
    req["ViewBag"] = {
        style: env === "production" ? true : false,
        title: "Home Page"
    };
    next();
    return;
};
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
                next();
            } else {
                req["Users"] = users.User.dataValues;
                req.ViewBag["User"] = users.User.dataValues;
                next();
            }
        })
        .catch(function (error) {
            res.status(500).render("error", { error });
        });
}

function view(req, res, next) {
    req['data'] = {
        ViewBag: req.ViewBag,
    };
    req['renderInfo'] = {
        view: 'index',
        status: 200
    };
    next();
    return;
}
function syncBlogs(req, res, next) {
    const BlogModelSync = BlogModel.sync();
    BlogModelSync.then(() => { next() });
    BlogModelSync.catch((error) => { res.send(error) })
}
function syncUsers(req, res, next) {
    const UserModelSync = UserModel.sync();
    UserModelSync.then(() => { next() });
    UserModelSync.catch((error) => { res.send(error) })
}
function findUsers(req, res, next) {

    const blogs = req.ViewBag.blogs;
    const FoundUsers = [];
    if(blogs.length === 0){
        next();
    }
    let index = 0;
    for (let blog of blogs) {
        let UserModelFind = UserModel.findOne({ where: { userid: blog.user_id } });
        UserModelFind.then((user) => {
            req.ViewBag.blogs[index]["profile_pic"] = user.dataValues.profile_pic;
            index++;
            if (index == (blogs.length)) {
                next();
            }
        });
        UserModelFind.catch((error) => { console.log(error) });
    }
}
function blogTagsToArr(req, res, next) {
    const blogs = req.ViewBag.blogs;
    if(blogs.length === 0){
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
    if(blogs.length === 0){
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
function getBlogs(req, res, next) {
    const BlogModelFindAll = BlogModel.findAll({ order: '"updatedAt" DESC' });
    BlogModelFindAll.then((blogs) => {
        req.ViewBag["blogs"] = [];
        for (let blog of blogs) {
            req.ViewBag["blogs"].push(blog.dataValues);
        }
        next();
    });
    BlogModelFindAll.catch((error) => {
        res.send(error);
    });
};

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
    return Math.floor(seconds) + " sec";
}

function render(req, res, next) {
    const ri = req.renderInfo;
    const data = req.data;

    res.render(ri.view, data,
        function (err, html) {
            if (err) {
                err.status = 500;
                console.log(err);
                throw err
            }
            else {
                res.status(ri.status).send(html);
                res.end();
            }
        }
    );
}

router.get('/', setHomeEnviormentVars, syncUserRoles, findUser, view, syncBlogs, getBlogs, syncUsers, findUsers, blogTagsToArr, dateToStamp, render);
router.get('/products', setProductsEnviormentVars, findUser, productsView, render);

module.exports = router;
