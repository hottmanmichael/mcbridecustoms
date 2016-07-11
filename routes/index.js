'use strict';
var express = require('express'),
    router = express.Router();


//index page
router.get('/', function(req, res) {
    res.render('index', {page_title: 'Home'});
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




module.exports = router;
