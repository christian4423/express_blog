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
function blogTagsToArr(req, res, next) {
    const blogs = req.ViewBag.blogs;
    if (blogs.length === 0) {
        next();
    }
    let index = 0;
    for (let blog of blogs) {
        let tags = blog.blog.tags;
        var tag_arr = tags.split(" ");
        req.ViewBag.blogs[index].blog["tags"] = tag_arr;
        index++;
    }
    next();
}
function dateToStamp(req, res, next) {
    const blogs = req.ViewBag.blogs;
    if (blogs.length === 0) {
        next();
    }
    let index = 0;
    for (let blog of blogs) {
        let date = blog.blog.user_updated;
        let time_ago = timeSince(date);
        req.ViewBag.blogs[index].blog["time_ago"] = time_ago;
        index++;
    }
    next();
}
function getBlogs(req, res, next) {
    const BlogModelFindAll = BlogModel.findAll({
        order: '"updatedAt" DESC',
        include: [{
            model: models.User,
            as: "User"
        }]
    });
    BlogModelFindAll.then((blogs) => {
        req.ViewBag["blogs"] = [];
        for (let blog of blogs) {
            let blog_obj = {
                blog: blog.dataValues,
                user: blog.User.dataValues
            }
            req.ViewBag["blogs"].push(blog_obj);
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

router.get('/', setViewBag, syncBlogs, syncUsers, getBlogs, blogTagsToArr, dateToStamp, render);

module.exports = router;
