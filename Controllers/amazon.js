var express = require('express');
var router = express.Router();
var models = require('../Models');
var jwt = require('jsonwebtoken');

const env = process.env.ENV;
const AAK = process.env.AMAZON_AK;
const ASK = process.env.AMAZON_SK;
const ATG = process.env.AMAZON_TAG;






//get views
router.get('/', function (req, res, next) {
    let env = process.env.ENV;
    let styleBool = env === "production" ? true : false;
    const token = req.decoded;
    const User = token.User;
    let isEdit;
    models.UserRole.findOne({
        where: {
            user_id: User.userid
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
                res.send({
                    Error: {
                        status: 500,
                        message: "No User Found"
                    }
                })
                next();
            } else {
                req["Users"] = users;
                if (users.dataValues.userid !== token.userid) {
                    isEdit = true;
                } else {
                    token.Role === "Admin" ? isEdit = true : isEdit = false;
                }


                req.ViewBag = {
                    title: "Profile",
                    style: styleBool,
                    User: users.User.dataValues,
                    isEdit
                }
                next();
            }
        })
}, getData, render);

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

function getData(req, res, next) {
    const amazonProducts = require('amazon-products-api')({
        AccessKey: AAK,
        SecretKey: ASK,
        Tag: ATG
    });



    amazonProducts.operation('ItemSearch', {
        SearchIndex: "Music",
        Keywords: "Halestorm",
        ResponseGroup: 'Images,ItemAttributes,Offers,Reviews'
    })
        .then(function (res) {
            req.features = res;

            next();
        })
        .catch(function (error) {
            res.status(500).render("error", { error });
        });
}

function render(req, res, next) {
    const data = {
        features: req.features
    };
    
    res.render("Products/amazon", data,
        function (err, html) {
            if (err) {
                err.status = 500;
                console.log(err);
                throw err
            }
            else {
                res.status(200).send(html);
            }
        }
    );
}



router.get('/getItemsTest', getData, render);


module.exports = router;
