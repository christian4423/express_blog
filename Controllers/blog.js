var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
var BlogModel = models.blogs;


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
function checkUser(req, res, next) {
    if (req.session.user == null) {
        res.redirect("/");
        res.end();
    }
    next();
}
function postBlog(req, res, next) {
    console.log(res);
    console.log(req);
    const user = req.session.user;
    const fname = user.firstname
    const lname = user.lasttname
    const name = `${fname} ${lname}` 
    const data = req.body;
    const subject = data.subject;
    const body = data.body;
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
        blog_id: -1
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
                    res.end();
                })
        });
}

function goHome(req, res, next){
    res.redirect("/");
}


router.post('/postBlog', checkUser, postBlog);

router.get('/');


module.exports = router;
