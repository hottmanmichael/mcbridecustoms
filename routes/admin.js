'use strict';
var express = require('express'),
    router = express.Router();

var validator = require('validator');



//Menu for all admin functionalities
router.get('/', function(req, res) {
    res.render('admin/admin');
});

// see full gallery
router.get('/gallery', function(req, res) {
    res.render('admin/gallery');
});

//get upload photo
router.get('/gallery/upload', function(req, res) {

});

//post upload photo

//put update photo details

//delete photo

//get update admin user settings
    //name, email, password
router.get('/settings', function(req, res) {
    res.render('admin/settings');
});


//post update settings
router.post('/settings/edit', function(req, res, next) {
    if (req.query.email) {
        var email = req.body.email;
        if (validator.isEmail(email)) {
            updateEmail();
        } else {
            res.redirect('')
        }
    } else if (req.query.password) {
        updatePassword();
    } else if (req.query.username) {
        updateUsername();
    } else {
        var err = new Error('Invalid Post to settings')
        next(err);
    }
    function updateEmail() {
        var email = req.body.email;
        if (validator.isEmail(email)) {

        }
    }
    function updateUsername() {
        res.json({
            p: req.body
        });
    }
    function updatePassword() {
        res.json({
            p: req.body
        });
    }
});


//get content changes

//post content changes


module.exports = router;
