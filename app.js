'use strict';
require('./node_modules/dotenv/lib/main').config();


const express = require('express'),
    pug = require('pug'),
    session = require('express-session'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    serveIndex = require('serve-index'),
    routes = require('./Controllers/index'),
    usersController = require('./Controllers/users'),
    amazonController = require('./Controllers/amazon'),
    initDBController = require('./Controllers/initDB'),
    accountController = require('./Controllers/account'),
    profileController = require('./Controllers/profile'),
    setUserController = require('./Controllers/setUserMiddleware'),
    blogController = require('./Controllers/blog'),
    authController = require('./Controllers/authenticate'),
    verifyTokenController = require('./Controllers/verify'),
    helmet = require('helmet'),
    app = express(),
    webpack = require('webpack'),
    webpackDevMiddleware = require('webpack-dev-middleware'),
    webpackHotMiddleware = require('webpack-hot-middleware'),
    config = require('./webpack.dev.config'),
    compiler = webpack(config),
    hiddenConfig = require("./config"),
    jwt = require('jsonwebtoken');





const env = process.env.ENV;


// view engine setup
app.set('views', path.join(__dirname, 'Views'));
app.set('view engine', 'pug');


//express settings
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.set('jwt_sk', process.env.JWT_SK);

app.use("/photos", express.static(path.join(__dirname, 'photos')));
app.use(function (req, res, next) {
    req.Path= __dirname;
    next()
});
//console.log(`In enviorment: ${env}`)
if (env === 'development') {
    //Access-Control
    app.use(function (req, res, next) {

        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', __dirname);

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        next()
    });



    //Hot Reload
    app.use(webpackDevMiddleware(compiler, {
        hot: true,
        filename: config.output.filename,
        publicPath: config.output.publicPath,
        stats: {
            colors: true,
        },
        noInfo: true
    }));

    app.use(webpackHotMiddleware(compiler, {
        log: console.log,
        heartbeat: 10 * 1000
    }));
    //error report view
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
        next()
    });

    //Routes
    app.use("/files", serveIndex(path.join(__dirname, '/'), { icons: true }));
};

if (env === "production") {
    //Access-Control
    app.use(helmet());
    //Static Files
    app.use("/public", express.static(path.join(__dirname, 'public')));

}





app.use('/initDB', initDBController);
app.use("/api", authController);
app.use('/users', usersController);


app.use(verifyTokenController);
app.use(setUserController);

app.use('/', routes);
app.use('/profile', profileController);
app.use('/account', accountController);
app.use('/amazon', amazonController);
app.use('/blog', blogController);






module.exports = app;

