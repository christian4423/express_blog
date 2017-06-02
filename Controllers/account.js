var express = require('express');
var router = express.Router();
var models = require('../Models');
var UserModel = models.User;
var UserRoleModel = models.UserRole;
const fs = require('fs');
var multer = require('multer')




var storage = multer.diskStorage({
    destination: function (req, file, cb) {

        var pathName = `photos/users/${req.user.dataValues.userid}`;
        var p = mkdirSync(pathName)
        cb(null, pathName)
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}.jpg`);
    }
})

const mkdirSync = (dirPath) => {
    try {
        fs.mkdirSync(dirPath)
    } catch (err) {
        if (err.code !== 'EEXIST') throw err
    }
}

// todo: implement
const imageFilter = (req, file, cb) => {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ storage: storage }).single("profile_pic")

//Middlewares
router.use(syncUserRoles, syncUsers)

// GETS
router.get('/', setEnvVarsAccountGet, syncUserRoles, syncUsers, makeFindUserObj, findUser, validateEdit, render);
router.get('/edit/:id', setEnvVarsEditGet, makeFindUserObj, findUser, validateEdit, renderEditGet);
// POSTS
router.post('/edit', setEnvVarsEditPost, syncUserRoles, syncUsers, validateEditPost, handleProfilePictureUpload, writeEditToDB, redirect);



// functions

// sets enviorment vars for layout


// get funcs
function setEnvVarsAccountGet(req, res, next) {
    let env = process.env.ENV;
    let styleBool = env === "production" ? true : false;
    let isEdit;
    const token = req.decoded;
    const User = token.User;
    req.ViewBag = {
        title: "Account",
        style: styleBool,
        User,
        isEdit
    }
    next();
}
function setEnvVarsEditGet(req, res, next) {
    let env = process.env.ENV;
    let styleBool = env === "production" ? true : false;
    let isEdit;
    const token = req.decoded;
    const User = token.User;
    req.ViewBag = {
        title: "Edit",
        style: styleBool,
        User,
        isEdit
    }
    next();
}

function syncUserRoles(req, res, next) {
    var UserRoleModelSync = UserRoleModel.sync();
    UserRoleModelSync.then(() => { next() });
    UserRoleModelSync.catch((error) => { res.send(error) });
}
function syncUsers(req, res, next) {
    const UserModelSync = UserModel.sync();
    UserModelSync.then(() => { next() });
    UserModelSync.catch((error) => { res.send(error) })
}
// makes object to find user
function makeFindUserObj(req, res, next) {
    const User = req.ViewBag.User;
    const UserRoleWhere = { where: { user_id: User.userid } }
    const UserRoleInclude = [
        {
            model: models.User,
            as: "User"
        },
        {
            model: models.Role,
            as: "Role"
        }
    ]
    const UserRoleFindOneObj = {
        UserRoleWhere,
        include: UserRoleInclude
    }
    req["user_role_find_obj"] = UserRoleFindOneObj;
    next();
}
// find user in token
function findUser(req, res, next) {
    const UserRoleFindOneObj = req["user_role_find_obj"];
    const UserRoleFindOne = models.UserRole.findOne({ where: { user_id: req.ViewBag.User.userid }, include: UserRoleFindOneObj.include });
    UserRoleFindOne.then((user) => {
        if (user == null) {
            const err = {
                error: true,
                message: "User Profile Not Found.",
                error
            }
            res.status(500).send(err);
        } else {
            req["User"] = user;
            next();
        }
    })
    UserRoleFindOne.catch((error) => {
        const err = {
            error: true,
            message: "Could not create user model",
            error
        }
        res.status(500).send(err);
    })
}
// set isEdit in ViewBag
function validateEdit(req, res, next) {
    const user = req["User"]
    const token = req.decoded;
    let isEdit = false;
    token.Role === "Admin" ? isEdit = true : isEdit = isEdit;
    user.dataValues.user_id === token.User.userid ? isEdit = true : isEdit = isEdit;
    
    req.ViewBag["User"] = user.User.dataValues;
    req.ViewBag["isEdit"] = isEdit;
    next();
}
// render account/index
function render(req, res) {
    res.render('Account/index', req, (err, html) => { err != null ? res.send(err) : res.send(html) });
}

// render account/edit
function renderEditGet(req, res) {
    if (req.ViewBag.isEdit === false) {
        res.send({
            Error: {
                status: 401,
                message: "Unauthorized"
            }
        })
    } else {
        res.render('Account/edit', req, (err, html) => { err != null ? res.send(err) : res.send(html) });
    }

}



// post funcs
// sets enviorment vars for layout
function setEnvVarsEditPost(req, res, next) {
    let env = process.env.ENV;
    let styleBool = env === "production" ? true : false;
    let isEdit;
    const token = req.decoded;
    const User = token.User;
    req.ViewBag = {
        title: "Edit",
        style: styleBool,
        User,
        isEdit
    }
    next();
}
// checking if user is admin or user is the same as the profile being edited.
// no user role needed
function validateEditPost(req, res, next) {
    const token = req.decoded;
    const User = token.User;
    UserModel.findOne({
        where: {
            user_id: User.userid
        }
    })
        .then(function (user) {
            if (user == null) {
                res.send({
                    Error: {
                        status: 500,
                        message: "No User Found"
                    }
                })
            } else {
                let isEdit = false;
                token.Role === "Admin" ? isEdit = true : isEdit = isEdit;
                user.dataValues.userid === token.User.userid ? isEdit = true : isEdit = isEdit;
                req.user = user;

                if (isEdit === false) {
                    res.send({ Error: { status: 401, message: "Unauthorized" } })
                } else {
                    req.ViewBag.isEdit = isEdit;
                    next();
                }


            }
        })
        .catch(function (error) {
            res.status(500).render("error", { error });
        });
}
// saves file to system
function handleProfilePictureUpload(req, res, next) {
    upload(req, res, function (err) {
        if (err) throw err;
        next();
    })
}
// writes form data to database
function writeEditToDB(req, res, next) {
    const UserModelSync = UserModel.sync();
    UserModelSync.then(() => {
        const fd = req.body; // form data
        const profile_pic = `/${req.file.path}`;
        const update_obj = { firstname: fd.firstname, lastname: fd.lastname, email: fd.email, profile_pic };
        const condition_obj = { where: { userid: fd.userid } };
        const UserModelUpdate = UserModel.update(update_obj, condition_obj);
        UserModelUpdate.then((responce) => {
            req["userResponce"] = responce;
            next();
        });
        UserModelUpdate.catch((error) => {
            const err = {
                error: true,
                message: "Could not create user model",
                error
            }
            res.status(500).send(err);
        })
    })
    UserModelSync.catch((error) => {
        const err = {
            error: true,
            message: "Could not sync with database",
            error
        }
        res.status(500).send(err);
    });
}
// back to account/index
function redirect(req, res) {
    res.redirect("/Account/")
}





module.exports = router;

