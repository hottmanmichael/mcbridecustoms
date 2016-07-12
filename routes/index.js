'use strict';
var express = require('express'),
    router = express.Router();

var emailer = require('../emailer');

var cloudinary = require('cloudinary');
var knex = require('../db/knex');
var Promise = require('bluebird');
function Gallery() {
    return knex('gallery');
}


//index page
router.get('/', function(req, res) {
    Gallery().where({isFeatured: true}).then(function(images) {

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
    Promise.join(
        Gallery().where({order: null}).orderBy('uploaded_at', 'desc'),
        Gallery().whereNot({order: null}).orderBy('order', 'asc')
    ).then(function(data) {
        //first grab newest, unorded images, then all ordered afterward
        var nulled = data[0];
        var ordered = data[1];
        var images = nulled.concat(ordered);
        images.map(function(image){
            image.img_tag = cloudinary.image(image.img_url, { width: 270, height: 270, crop: "fill" });
            return image;
        });
        var messages, errors;
        if (req.session.messages) {
            messages = req.session.messages;
            req.session.messages = null;
        }
        if (req.session.errors) {
            errors = req.session.errors;
            req.session.errors = null;
        }
        return res.render('gallery', {
            page_title: 'Gallery',
            images: images,
            messages: messages,
            errors: errors
        });
    });
});
router.get('/services', function(req, res) {
    res.render('services', {page_title: 'Services'});
});
router.get('/contact', function(req, res) {
    res.render('contact', {page_title: 'Contact'});
});

router.post('/contact', function(req, res) {
    // return res.json(req.body);
    emailer.send({
        email: req.body.email,
        name: req.body.name,
        subject: req.body.subject,
        message: req.body.message
    }, function(response) {
        return res.json(response);
    });
});


// eye appt
// Tuesday 2nd @ 9:10;




module.exports = router;
