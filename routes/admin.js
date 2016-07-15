'use strict';
var express = require('express'),
    router = express.Router();

var knex = require('../db/knex');
var bcrypt = require('bcrypt');
var validator = require('validator');
var moment = require('moment');
var uploader = require('../uploader');
var cloudinary = require('cloudinary');
var Promise = require('bluebird');
cloudinary.config({
    cloud_name: 'mhottman',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

function Admins() {
    return knex('admins');
}
function Gallery() {
    return knex('gallery');
}


//Menu for all admin functionalities
router.get('/', function(req, res) {
    var lli = req.session.user.last_logged_in;
    var user = {
        email: req.session.user.email,
        username: req.session.user.username,
        last_logged_in: moment(lli).fromNow()
    };
    res.render('admin/admin', {
        page_title: 'Admin Home',
        user: user
    });
});

// see full gallery
router.get('/gallery', function(req, res) {

    Promise.join(
        Gallery().where({order: null}).orderBy('uploaded_at', 'desc'),
        Gallery().whereNot({order: null}).orderBy('order', 'asc')
    ).then(function(data) {
        //first grab newest, unorded images, then all ordered afterward
        var nulled = data[0];
        var ordered = data[1];
        var images = nulled.concat(ordered);
        //deep copy array of images to change the properties on only ONE of the arrays
        var allimages = JSON.parse(JSON.stringify(images));
        var featured = [];

        allimages.forEach(function(img) {
            console.log("img: ", img.isFeatured);

            if (img.isFeatured) {
                img.img_tag = cloudinary.image(img.cloudinary_id, { height: 270, angle: "exif" });
                featured.push(img);
            }
        });


        images.forEach(function(image){

            image.img_tag = cloudinary.image(image.cloudinary_id, { width: 270, angle: "exif" });
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


        return res.render('admin/gallery', {
            page_title: 'Gallery',
            images: images,
            featured: featured,
            messages: messages,
            errors: errors
        });
    });
});

//get upload photo page
router.get('/gallery/upload', function(req, res) {
    Gallery().orderBy('uploaded_at', 'desc').then(function(images) {
        images = images.filter(function(image) {
            var up = moment(image.uploaded_at);
            var now = moment();
            var diffMins = now.diff(up, 'minutes');
            if (diffMins < 20) {
                image.uploaded_at = moment(image.uploaded_at).fromNow();
                image.img_tag = cloudinary.image(image.cloudinary_id, { height: 270, angle: "exif" });
                return true;
            } else {
                return false;
            }
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
        return res.render('admin/upload', {
            page_title: 'Upload',
            images: images,
            messages: messages,
            errors: errors
        });
    });
});

//post upload photo
router.post('/gallery/upload', function(req, res) {

    uploader.upload(req).then(function(uploaded) {
        // data.uploadData = uploaded;
        uploader.toCloud(uploaded.images).then(function(results) {
            // data.cloudData = results;
            var done = 0;
            results.forEach(function(image) {
                uploader.toDatabase({
                    slug: image.original_filename,
                    img_url: image.url,
                    cloudinary_id: image.public_id
                }).then(function(db) {
                    ++done;
                    var imgToRemove = image.original_filename + "." + image.format;
                    uploader.removeFromDir(imgToRemove, function(err, success) {
                        if (err) {return console.error(err);}
                        // console.log("file removed from dir successfully", success);
                    });
                    if (done === uploaded.images.length) {
                        uploader.deleteDir(function(err, success) {
                            if (err) {return console.error(err);}
                            // console.log("dir deleted", success);
                        });
                        res.redirect('/admin/gallery/upload');
                    }
                });
            });
        });
    });



    //
    // var data = {};
    // uploader.upload(req).then(function(uploaded) {
    //     // if (!uploaded.formData.isFeatured) {
    //     //     uploaded.formData.isFeatured = false;
    //     // } else {uploaded.formData.isFeatured = true;}
    //
    //     data.uploadData = uploaded;
    //
    //     uploader.toCloud(data.uploadData.image.file).then(function(result) {
    //         data.cloudData = result;
    //         uploader.toDatabase({
    //             cloud: data.cloudData,
    //             upload: data.uploadData
    //         }).then(function(db_data) {
    //             uploader.removeFromDir(data.uploadData).then(function(success) {console.log('removed image from dir');});
    //             res.redirect('/admin/gallery/upload');
    //         }).catch(function(err) {
    //             console.error("Error saving to database", err);
    //         });
    //     }).catch(function(err) {
    //         console.error("Error saving to cloud:", err);
    //     });
    // }).catch(function(err) {
    //     console.error("Error saving to filesystem", err);
    // });
});



//put update photo details
//remove from or add to featured list
router.put('/gallery/edit/isfeatured', function(req, res, next) {
    var slug = req.query.slug;
    var action = req.query.action; //should be add or remove
    console.log("res action: ", Boolean(Number(req.query.action)));

    var method = (action === 'add') ? true : false;
        //remove == set to false, add set to true in isFeatured col

    Gallery().where({slug: slug}).then(function(image) {
        image = image[0];
        if (image.isFeatured && action === 'add') {
            return res.json({
                status: 'error',
                message: 'Image already in featured list.'
            });
        }
        if (!image.isFeatured && action === 'remove') {
            return res.json({
                status: 'error',
                message: 'Cannot remove this image, it is not in featured list'
            });
        }
        Gallery().where({slug: slug}).update({
            isFeatured: method
        }).returning('cloudinary_id').then(function(updated) {
            var imgUrl = updated[0];
            //if add
            if (action === 'add') {
                return res.json({
                    status: 'success',
                    method: action,
                    slug: slug,
                    data: updated,
                    tag: cloudinary.image(imgUrl, { height: 270, angle: 'exif' }),
                    message: 'Image added to featured list'
                });
            }
            if (action === 'remove') {
                return res.json({
                    status: 'success',
                    method: action,
                    slug: slug,
                    message: 'Image removed from featured list'
                });
            }
        }).catch(function(err) {
            return res.json({
                status: 'error',
                method: action,
                message: 'An unknown error occured. Please reload the page and try again'
            });
        });
    }).catch(function(err) {
        return res.json({
            status: 'error',
            method: action,
            message: 'An unknown error occured. Please reload the page and try again'
        });
    });
});


//delete photo
router.delete('/gallery/delete', function(req, res, next) {
    var slug = req.query.slug;

    Gallery().where({slug: slug}).then(function(image) {
        image = image[0];

        var pid = image.img_url.substring(image.img_url.lastIndexOf('/')+1, image.img_url.lastIndexOf('.'));

        cloudinary.uploader.destroy(pid, function(result) {
            //image removed
        });

        Gallery().where({slug: slug}).del().then(function(deleted) {
            return res.json({
                status: 'success',
                message: 'Image delete successfully.',
                slug: slug
            });
        }).catch(next);
    }).catch(next);

});

router.post('/gallery/edit/order', function(req, res) {
    var images = req.body.images;
    var promises = [];
    var prefix = 'mason-';

    function makePromise(img) {
        console.log("img.order: ", img.order);
        console.log("img.slug: ", img.slug);
        return Gallery().where({slug: img.slug}).update({
            order: img.order
        });
    }

    images.forEach(function(image) {
        image.slug = image.slug.substring(prefix.length, image.slug.length);
        console.log("image: ", image);
        var prom = makePromise(image);
        promises.push(prom);
    });

    Promise.all(promises).then(function(ret) {
        res.json({
            status: 'success'
        });
    }).catch(function(err) {
        res.json({
            status: 'failure'
        });
    });

});

//get update admin user settings
    //name, email, password
router.get('/settings', function(req, res) {
    var errors = null;
    var messages = null;
    if (req.session.errors) {
        errors = req.session.errors;
        req.session.errors = null;
    }
    if (req.session.messages) {
        messages = req.session.messages;
        req.session.messages = null;
    }
    res.render('admin/settings', {
        page_title: 'Settings',
        errors: errors,
        messages: messages
    });
});


//post update settings
router.post('/settings/edit', function(req, res, next) {
    if (req.query.email) {
        var email = req.body.email;
        if (validator.isEmail(email)) {
            updateEmail();
        } else {
            req.session.errors = [
                {
                    message: 'Your new email was not saved. Please enter a valid email.'
                }
            ];
            res.redirect('/admin/settings');
        }
    } else if (req.query.password) {
        updatePassword();
    } else if (req.query.username) {
        updateUsername();
    } else {
        var err = new Error('Invalid Post to settings');
        next(err);
    }
    function updateEmail() {
        var email = req.body.email;
        if (validator.isEmail(email)) {
            Admins().where({email: req.session.user.email})
                .update({email: req.body.email})
                .returning('email')
                .then(function(email) {
                    req.session.user.email = email[0];
                    req.session.messages = [
                        'Your new email was saved successfully as ' + email[0]
                    ];
                    return res.redirect('/admin/settings');
                }).catch(function(err) {
                    req.session.messages = [
                        {
                            message: 'That email already exists, unable to update email address.'
                        }
                    ];
                    return res.redirect('/admin/settings');
                });
        }
    }
    function updateUsername() {
        Admins().where({email: req.session.user.email})
            .update({username: req.body.username})
            .returning('username')
            .then(function(username) {
                req.session.user.username = username[0];
                req.session.messages = [
                    'Your new username was saved successfully as ' + username[0]
                ];
                return res.redirect('/admin/settings');
            }).catch(function(err) {
                req.session.errors = [
                    {
                        message: 'That username already exists, unable to update username.'
                    }
                ];
                return res.redirect('/admin/settings');
            });
    }
    function updatePassword() {
        bcrypt.hash(req.body.password, 10, function(err, hash) {
            Admins().where({email: req.session.user.email})
                .update({password: hash})
                .returning('email')
                .then(function(email) {
                    req.session.messages = [
                        'Your new password was saved successfully for ' + email[0]
                    ];
                    res.redirect('/admin/settings');
                }).catch(next);
        });
    }
});


//get content changes

//post content changes


module.exports = router;
