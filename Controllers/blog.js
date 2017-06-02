var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
var BlogModel = models.blogs;
var UserRole = models.UserRole;
var UserModel = models.User;

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
function postBlog(req, res, next) {
    const token = req.decoded;
    const user = token.User;
    const fname = user.firstname
    const lname = user.lastname
    const name = `${fname} ${lname}`
    const data = req.body;
    let bod = data.body.replace(/\n\r?/g, '<br />');
    const subject = data.subject;
    const body = bod;
    const tags = data.tags;
    const user_id = parseInt(data.user_id);
    const user_added = name;
    const user_updated = Date.now();
    let modelObj = {
        subject,
        body,
        tags,
        user_id,
        user_added,
        user_updated,
    }
    req["modelObj"] = modelObj;
    BlogModel.sync().then(function () {

        BlogModel.create(modelObj)
            .then(function (responce) {
                req["res"] = responce;
                next();
            })
            .catch(function (error) {
                const err = {
                    error: true,
                    message: "Could not create user model",
                    error
                }
                res.status(500).send(err);
            })
    });
}

function goHome(req, res, next) {
    res.redirect("/");
}

router.use(syncUsers,BlogModelSync)

router.post('/postBlog', postBlog, goHome);

router.use(setEnvVarsBlogGet)
// router.post('/postBlog', postBlog, goHome);
router.get('/view/:id', GetBlog, findUsers, blogTagsToArr, dateToStamp, renderGet);
router.get('/edit/:id', GetBlog, findUsers, blogTagsToArr, renderGetEdit);
router.get('/myBlogs', GetMyBlogs, findUsers, blogTagsToArr, dateToStamp, renderGet);


function setEnvVarsBlogGet(req, res, next) {
    let env = process.env.ENV;
    let styleBool = env === "production" ? true : false;
    const token = req.decoded;
    const User = token.User;
    req.ViewBag = {
        title: "Blog",
        style: styleBool,
        User,
        blogs: []
    }
    next();
}
function BlogModelSync(req, res, next) {
    // let blog_id = req.params.id;
    let BMS = BlogModel.sync();
    BMS.then(() => { next() });
    BMS.catch((error) => { 
        res.send(error) 
    });
}
function GetBlog(req, res, next) {
    let blog_id = req.params.id;
    const BMFONE = BlogModel.findOne({ where: { blog_id } });
    BMFONE.then((blog) => {
        if (blog == null) {
            res.send({ status: 404, message: "Could not find blog." })
        } else {
            req.ViewBag["blogs"].push(blog.dataValues);
            next();
        }
    });
    BMFONE.catch((error) => { res.send(error) });
}
function GetMyBlogs(req, res, next) {
    const BMFONE = BlogModel.findAll({ where: { user_id: parseInt(req.decoded.User.userid) } });
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
    BMFONE.catch((error) => { res.send(error) });
}


function syncUsers(req, res, next) {
    const UserModelSync = UserModel.sync();
    UserModelSync.then(() => { next() });
    UserModelSync.catch((error) => { res.send(error) })
}
function findUsers(req, res, next) {
    const blogs = req.ViewBag.blogs;
    const FoundUsers = [];
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
    return Math.floor(seconds) + " sec";
}
function renderGet(req, res) {
    res.render("Blog/index", req);
}
function renderGetEdit(req, res) {
    res.render("Blog/edit", req);
}
module.exports = router;
