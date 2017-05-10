var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
var jwt = require('jsonwebtoken');




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

function findUser(req, res, next) {
    var userid = null;
    if (userid == null) {
        req["Users"] = null;
        next();
    } else {
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
                    req["Users"] = users;
                    next();
                }
            })
            .catch(function (error) {
                res.status(500).render("error", { error });
            });
    }
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

router.get('/', setHomeEnviormentVars, findUser, view, render);
router.get('/products', setProductsEnviormentVars, productsView, render);

module.exports = router;
