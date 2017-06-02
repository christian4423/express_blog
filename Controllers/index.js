var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
var jwt = require('jsonwebtoken');
var BlogModel = models.blogs;
var UserRole = models.UserRole;
var UserModel = models.User;





function setViewBag(req, res, next) {
    req["ViewBag"]["title"] = "Home Page";
    req['data'] = {
        ViewBag: req.ViewBag,
    };
    req['renderInfo'] = {
        view: 'index',
        status: 200
    };
    next();
    return;
};
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
            let data = user.dataValues;
            req.ViewBag.blogs[index]["profile_pic"] = data.profile_pic;
            let fn = data.firstname;
            let ln = data.lastname;
            req.ViewBag.blogs[index]["user_added"] = `${fn} ${ln} `;
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
        return interval + " yr";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " hr";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " day";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hr";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " min";
    }
    interval = Math.floor(seconds);
    if (interval === 0) {
        return "now";
    }    
    return Math.floor(seconds) + " sec";
}

function render(req, res) {
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
            }
        }
    );
}

router.get('/', setViewBag, syncBlogs, getBlogs, syncUsers, findUsers, blogTagsToArr, dateToStamp, render);

module.exports = router;
