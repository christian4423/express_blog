var express = require('express');
var router = express.Router();
var models = require('../Models');
var UserModel = models.User;
var pass = require('password-hash-and-salt');
var jwt = require('jsonwebtoken');




// route middleware to verify a token
router.use(function (req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.cookies.token;

  // decode token
  if (token) {
    const TOKEN = JSON.parse(token);
    const T = TOKEN.token;
      // verifies secret and checks exp
      jwt.verify(T, process.env.JWT_SK, function (err, decoded) {
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;
          next();
        }
      });

  } else {

    // if there is no token
    // return an error
    return res.render("Manage/loginPartial")

  }
});

module.exports = router;