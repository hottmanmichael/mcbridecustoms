'use strict';
var express = require('express'),
    router = express.Router();

var bcrypt = require('bcrypt');
var knex = require('../db/knex');

router.get('/login', function(req, res) {
    res.render('admin/login');
});

router.post('/login', function(req, res, next) {
    knex('admins').where({username: req.body.username})
        .then(function(user) {
            user = user[0];
            console.log("user: ", user, req.body.password);
            bcrypt.compare(req.body.password, user.password, function(err, result) {
                /**FIXME: return to login */
                if (err) {return next(err);}

                if (result) {
                    req.session.user = {
                        id: user.id,
                        username: user.username,
                        last_logged_in: user.logged_in_date,
                        logged_in_date: Date.now()
                    };
                    res.redirect('/admin');
                } else {
                    res.redirect('/auth/login');
                }
            });
        }).catch(next);
});


router.get('/logout', function(req, res) {
    req.session.user = null;
    res.redirect('/auth/login');
});

/** FIXME: DELETE THESE ROUTES */
router.get('/signup', function(req, res) {
    res.render('admin/signup');
});
router.post('/signup', function(req, res, next) {
    bcrypt.hash(req.body.password, 10, function(err, hash) {
        knex('admins').insert({
            username: req.body.username,
            password: hash
        }).then(function(data) {
            res.redirect('/auth/login');
        }).catch(function(err) {
            next(err);
        })
    });
});




module.exports = router;
