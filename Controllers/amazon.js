var express = require('express');
var router = express.Router();

const env = process.env.ENV;
const AAK = process.env.AMAZON_AK;
const ASK = process.env.AMAZON_SK;
const ATG = process.env.AMAZON_TAG;


function getData(req, res) {
    const amazonProducts = require('amazon-products-api')({
        AccessKey: AAK,
        SecretKey: ASK,
        Tag: ATG,
        Availability: "Available"
    });



    amazonProducts.operation('ItemSearch', {
        SearchIndex: req.query.SearchIndex,
        Keywords: req.query.Keywords,
        ResponseGroup: 'Images,ItemAttributes,Offers,Reviews',
        ItemPage: req.query.ItemPage
    })
        .then(function (data) {
            if(data.Items.Item.length == undefined){
                data.Items.Item = [data.Items.Item]
            }
            res.status(200).render("Products/_results", data.Items);
        })
        .catch(function (error) {
            res.status(500).render("error", { error });
        });
}

function getSingleData(req, res) {
    const amazonProducts = require('amazon-products-api')({
        AccessKey: AAK,
        SecretKey: ASK,
        Tag: ATG,
        Availability: "Available"
    });



    amazonProducts.operation('ItemSearch', {
        SearchIndex: "All",
        Keywords: req.query.product_id,
        ResponseGroup: 'Images,ItemAttributes,Offers,Reviews',
        ItemPage: "1"
    })
        .then(function (data) {
            if(data.Items.Item.length == undefined){
                data.Items.Item = [data.Items.Item]
            }
            res.status(200).render("Products/_resultFeature", data.Items);
        })
        .catch(function (error) {
            res.status(500).render("error", { error });
        });
}

router.get('/search', getData);
router.get('/searchForOne', getSingleData);

module.exports = router;
