var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;


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

function checkLoggedIn(req, res, next) {
    //console.log("Session:", req.session)
    if (req.session.user == null) {
        req.loggingIn = false;
        const str = `Guest`
        req.ViewBag.name = str;
    } else {
        console.log("USER LOGGED IN");
        req.loggingIn = true;
        const user = req.session.user;
        const fname = user.firstname;
        const lname = user.lastname;
        const str = `${fname}`
        req.ViewBag.name = str;
    }
    next();
    return;
}

function findUsers(req, res, next) {
    if (req.loggingIn === false) {
        next();
        return;
    }
    var userid = req.session.user.userid;
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
            console.log("USERS",users);
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
            res.end();
        });
}

function view(req, res, next) {
    if (req.loggingIn === false) {
        next();
        return;
    }
    req["hasUsers"] = true;
    req['data'] = {
        ViewBag: req.ViewBag,
        Model: req.Users.dataValues
    };
    req['renderInfo'] = {
        view: 'index',
        status: 200
    };    
    next();
    return;
}

function signUp(req, res, next) {    
    if (req.loggingIn === false || req.hasUsers == true) {
        next();
        return;
    }
    //console.log("Redirecting guest to sign up");
    req.ViewBag.title = "Signup Page";
    req['data'] = {
        ViewBag: req.ViewBag,
        Model: false
    };
    req['renderInfo'] = {
        view: 'Manage/signup',
        status: 200
    };
    next();
}

function logIn(req, res, next) {
    if (req.hasUsers === true || req.renderInfo != null) {
        next();
        return;
    }
    console.log("Redirecting guest to login");
    req.ViewBag.title = "Unauthorized";
    req['data'] = {
        ViewBag: req.ViewBag,
        Model: false
    };
    req['renderInfo'] = {
        view: 'Manage/login',
        status: 401
    }
    next();
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

router.get('/', setHomeEnviormentVars, checkLoggedIn, findUsers, view, signUp, logIn, render);
router.get('/products', setProductsEnviormentVars, checkLoggedIn, productsView, render);

module.exports = router;
