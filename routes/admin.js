'use strict';
var express = require('express'),
    router = express.Router();


//Menu for all admin functionalities
router.get('/', function(req, res) {
    res.render('admin/admin');
});


//get upload photo

//post upload photo

//put update photo details

//delete photo

//get content changes

//post content changes

//get update admin user settings
    //name, email, password

//post update settings



module.exports = router;
