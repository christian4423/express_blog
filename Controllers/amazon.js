var express = require('express');
var router = express.Router();
var models = require('../Models');
const env = process.env.ENV;
const AAK = process.env.AMAZON_AK;
const ASK = process.env.AMAZON_SK;
const ATG = process.env.AMAZON_TAG;

const amazonProducts = require('amazon-products-api')({
    AccessKey: AAK,
    SecretKey: ASK,
    Tag: ATG
});





function getData(req, res, next) {


    amazonProducts.operation('ItemSearch', {
        SearchIndex: "HomeGarden",
        Keywords: "toilet",
        ResponseGroup: 'Images,ItemAttributes,Offers,Reviews'
    })
        .then(function (res) {
            req.features = res;
            
            next();
        })
        .catch(function (error) {
            res.status(500).render("error", { error });
            res.end();
        });
}

function render(req, res, next){
    const data = {
      features: req.features
    };
    console.log(data);
    res.render("Products/amazon", data,
        function (err, html) {
            if (err) {
                err.status = 500;
                console.log(err);
                throw err
            }
            else {
                res.status(200).send(html);
                res.end();
            }
        }
    );
}



router.get('/getItemsTest', getData, render);


module.exports = router;