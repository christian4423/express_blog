var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
var BlogModel = models.blogs;
var BlogPopModel = models.BlogPopularity;
var BlogComModel = models.BlogComments;
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
    let product_id;

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
    if (data.product_id !== "" || data.product_id !== "-1") {
        modelObj["product_id"] = data.product_id;
    }
    req["modelObj"] = modelObj;
    BlogModel.sync().then(function () {

        BlogModel.create(modelObj)
            .then(function (responce) {
                req["newBlog"] = responce.dataValues;
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
function addCommentToBlog(req, res, next) {
    if (req.body.comment == "" || req.body.comment == null) {
        res.send({ Error: "Comment are required." });
    }
    BlogComModel.sync().then(function () {
        let d = req.body;
        let modelObj = {
            comment: d.comment,
            user_id: d.user_id,
            blog_id: d.blog_id
        }
        BlogComModel.create(modelObj)
            .then(function (responce) {
                req["newComment"] = responce.dataValues;
                res.send(responce);
            })
            .catch(function (error) {
                const err = {
                    error: true,
                    message: "Could Not Add Comment",
                    error
                }
                res.status(500).send(err);
            })
    });
}
function createPopulatrityTable(req, res, next) {
    let nb = req["newBlog"];
    BlogPopModel.sync().then(function () {

        BlogPopModel.create({
            blog_id: nb.blog_id,
            positive: 0,
            negative: 0,
        })
            .then(function (responce) {
                next();
            })
            .catch(function (error) {
                const err = {
                    error: true,
                    message: "Could not create popularity table",
                    error
                }
                res.status(500).send(err);
            })
    });
}
function getLatestBlog(req, res, next) {
    let nb = req["newBlog"];
    var io = req.app.get('socketio');
    const BlogModelFindOne = BlogModel.findAll({
        where: { blog_id: nb.blog_id },
        include: [{
            model: models.User,
            as: "User"
        }]
    });
    BlogModelFindOne.then((blogs) => {
        req.ViewBag["blogs"] = [];
        for (let blog of blogs) {
            blog.dataValues.tags = blog.dataValues.tags.split(" ");
            let date = blog.user_updated;
            let time_ago = timeSince(date);
            blog.dataValues["time_ago"] = time_ago;
            let blog_obj = {
                blog: blog.dataValues,
                user: blog.User.dataValues
            }
            req.ViewBag["blogs"].push(blog_obj);
        }



        res.render("Blog/blogSinglePartial", req.ViewBag["blogs"][0],
            function (err, html) {
                if (err) {
                    err.status = 500;
                    console.log(err);
                    throw err
                }
                else {
                    io.sockets.emit("new_blog", html);
                    res.end();
                }
            }
        );
    });
    BlogModelFindOne.catch((error) => {
        res.send(error);
    });
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


function updateBlogPopularity(req, res, next) {
    let blog_id = req.body.blog_id;
    let upvote = req.body.upvote;
    let inc_string = "negative";
    if (upvote == "true") {
        inc_string = "positive";
    }

    BlogPopModel.sync().then(function () {

        BlogPopModel.build({ blog_id: blog_id }, { isNewRecord: false }).increment(inc_string)
            .then(function (blog_pop) {
                let io = req.app.get('socketio');
                io.sockets.emit("blog_pop", blog_pop.dataValues);
                res.end();

            })
            .catch(function (error) {
                const err = {
                    error: true,
                    message: "Could not create popularity table",
                    error
                }
                res.status(500).send(err);
            })
    });
}


router.use(syncUsers, BlogModelSync)

router.post('/postBlog', postBlog, BlogModelSync, createPopulatrityTable, getLatestBlog);
router.post('/edit/', updateBlog, BlogModelSync, GetBlog, findUsers, blogTagsToArrDepricated, dateToStampDeprecated, returnNewBlogView);
router.post('/delete/', deleteBlog);
//router.post('/popularity/', updateBlogPopularity, getNewPopularityValues, returnNewValues);
router.post('/popularity/', updateBlogPopularity);
router.post('/comment/', addCommentToBlog);

// router.post('/postBlog', postBlog, goHome);
router.get('/view/:id', setEnvVarsBlogGet, GetBlogCurrent, blogTagsToArrCurrent, dateToStampCurrent, renderGet);
router.get('/edit/:id', setEnvVarsBlogGet, GetBlog, findUsers, blogTagsToArrDepricated, renderGetEdit);
router.get('/myBlogs', setEnvVarsBlogGet, GetMyBlogs, blogTagsToArrCurrent, dateToStampCurrent, renderGet);
router.get('/comments', GetComments);



function GetComments(req, res, next) {
    let blog_id = req.params.blog_id || req.body.blog_id || req.query.blog_id;
    const BCM_ALL = BlogComModel.findAll({
        where: { blog_id }, order: '"updatedAt" DESC', include: [{
            model: models.User,
            as: "User"
        }]
    });
    BCM_ALL.then((comments) => {
        if (comments == null) {
            res.send({ status: 404, message: "No Comments" })
        } else {
            var arr = [];
            for (let comment of comments) {
                let updated_at = comment.dataValues.updatedAt;
                comment.dataValues.updatedAt = updated_at.toLocaleDateString();
                let obj = {
                    user: comment.User.dataValues,
                    comment: comment.dataValues
                }
                arr.push(obj);
            }
            req.ViewBag["comments"] = arr;
            req.ViewBag["blog_id"] = blog_id
            res.render("shared/blogs/_comments", req.ViewBag)
        }
    });
    BCM_ALL.catch((error) => {
        res.send(error)
    });
}


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
function GetBlogCurrent(req, res, next) {
    let blog_id = req.params.id || req.blog_id;
    const BMFONE = BlogModel.findOne({
        order: '"updatedAt" DESC',
        include: [{
            model: models.User,
            as: "User"
        }, {
            model: models.BlogPopularity,
            as: "Popularity"
        }]
    });
    BMFONE.then((blog) => {
        if (blog == null) {
            res.send({ status: 404, message: "Could not find blog." })
        } else {
            req.ViewBag["blogs"] = [];
            blog = blog.dataValues
            let blog_obj = {
                blog: blog,
                user: blog.User.dataValues,
                rep: blog.Popularity.dataValues
            }
            req.ViewBag["blogs"].push(blog_obj);
            next();
        }
    });
    BMFONE.catch((error) => { res.send(error) });
}
function GetMyBlogs(req, res, next) {
    const BMFONE = BlogModel.findAll({
        order: '"updatedAt" DESC',
        include: [{
            model: models.User,
            as: "User"
        }, {
            model: models.BlogPopularity,
            as: "Popularity"
        }]
    });
    BMFONE.then((blogs) => {
        if (blogs == null) {
            res.send({ status: 404, message: "Could not find blog." })
        } else {
            req.ViewBag["blogs"] = [];
            for (let blog of blogs) {
                let blog_obj = {
                    blog: blog.dataValues,
                    user: blog.User.dataValues,
                    rep: blog.Popularity.dataValues
                }
                req.ViewBag["blogs"].push(blog_obj);
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
    if (blogs.length <= 0) {
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
function blogTagsToArrDepricated(req, res, next) {
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

function blogTagsToArrCurrent(req, res, next) {
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
function dateToStampCurrent(req, res, next) {
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
function dateToStampDeprecated(req, res, next) {
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
function renderGet(req, res) {
    res.render("Blog/index", req);
}
function renderGetEdit(req, res) {
    res.render("Blog/edit", req);
}
module.exports = router;
