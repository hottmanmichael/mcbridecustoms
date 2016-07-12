'use strict';
var express = require('express'),
    router = express.Router();
var knex = require('../db/knex');
var cloudinary = require('cloudinary');
var emailer = require('../emailer');

// var nodemailer = require('nodemailer');
function Gallery() {
    return knex('gallery');
}


//index page
router.get('/', function(req, res) {
    Gallery().then(function(images) {
        images.map(function(image){
            image.img_tag = cloudinary.image(image.img_url, { width: 500, height: 500, crop: "fill" });
            return image;
        });

        res.render('index', {
            page_title: 'Home',
            images: images
        });
    });
});
router.get('/about', function(req, res) {
    res.render('about', {page_title: 'About'});
});
router.get('/gallery', function(req, res) {
    res.render('gallery', {page_title: 'Gallery'});
});
router.get('/services', function(req, res) {
    res.render('services', {page_title: 'Services'});
});
router.get('/contact', function(req, res) {
    res.render('contact', {page_title: 'Contact'});
});

router.post('/contact', function(req, res) {
    var email = {
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        text_body: req.body.text_body + " \n "+ req.body.name + " \n " + req.body.email,
        to: 'hottmanmichael@gmail.com'
    };

    emailer.send(email, function(err, result) {
        res.json({
            result: result,
            status: 'success || failure',
            err: err
        });
    });
    // emailer.sms({}, function(err, result) {
    //     res.json({
    //         err: err,
    //         result: result
    //     });
    // });

});




module.exports = router;
