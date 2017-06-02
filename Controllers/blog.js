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
function updateBlog(req, res, next) {
    req["ViewBag"]["blogs"] = []
    const data = req.body;
    let bod = data.body.replace(/\n\r?/g, '<br />');
    const subject = data.subject;
    const body = bod;
    const tags = data.tags;
    const user_id = parseInt(req.User.userid);
    const user_added = data.user_updated;
    const user_updated = Date.now();
    const blog_id = data.blog_id;
    let modelObj = {
        subject,
        body,
        tags,
        user_added,
        user_updated,
    }
    req["blog_id"] = parseInt(blog_id);
    req["modelObj"] = modelObj;
    BlogModel.sync().then(function () {
        const condition_obj = { where: { blog_id: req.blog_id } };
        const BlogModelUpdate = BlogModel.update(modelObj, condition_obj);
        BlogModelUpdate.then(function (responce) {
            next();
        });
        BlogModelUpdate.catch(function (error) {
            const err = {
                error: true,
                message: "Could not create user model",
                error
            }
            res.status(500).send(err);
        })
    });




}
function deleteBlog(req, res) {
    const data = req.body;
    let blog_id = data.blog_id;
    BlogModel.sync().then(function () {
        const condition_obj = { where: { blog_id: req.blog_id } };
        const BlogModelUpdate = BlogModel.destroy({ where: { blog_id } });
        BlogModelUpdate.then(function (responce) {
            res.status(200).send({ error: false, status: 200, message: "blog deleted" });
        });
        BlogModelUpdate.catch(function (error) {
            const err = {
                error: true,
                message: "Could delete blog",
                error
            }
            res.status(500).send(err);
        })
    });
}

function getUpdatedBlog(req, res, next) {
    res.send(req["modelObj"])
    //res.render("Blog/blogPartial", req.blog);
}
function returnNewBlogView(req, res, next) {
    res.render("Blog/blogPartial", { blog: req.ViewBag.blogs[0] });
}

router.use(syncUsers, BlogModelSync)

router.post('/postBlog', postBlog, goHome);
router.post('/edit/', updateBlog, BlogModelSync, GetBlog, findUsers, blogTagsToArr, dateToStamp, returnNewBlogView);
router.post('/delete/', deleteBlog);

// router.post('/postBlog', postBlog, goHome);
router.get('/view/:id', setEnvVarsBlogGet, GetBlog, findUsers, blogTagsToArr, dateToStamp, renderGet);
router.get('/edit/:id', setEnvVarsBlogGet, GetBlog, findUsers, blogTagsToArr, renderGetEdit);
router.get('/myBlogs', setEnvVarsBlogGet, GetMyBlogs, findUsers, blogTagsToArr, dateToStamp, renderGet);






function setEnvVarsBlogGet(req, res, next) {
    req.ViewBag["title"] = "Blog";
    req.ViewBag["blogs"] = [];
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
    let blog_id = req.params.id || req.blog_id;
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
    const BMFONE = BlogModel.findAll({ where: { user_id: parseInt(req.decoded.User.userid) }, order: '"updatedAt" DESC' });
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
    if(blogs.length <= 0){
        next();
    }
    const FoundUsers = [];
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
    if(blogs.length <= 0){
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
    if(blogs.length <= 0){
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
function renderGet(req, res) {
    res.render("Blog/index", req);
}
function renderGetEdit(req, res) {
    res.render("Blog/edit", req);
}
module.exports = router;
