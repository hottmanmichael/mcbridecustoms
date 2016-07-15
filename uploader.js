'use strict';
var fs = require('fs'),
    formidable = require('formidable'),
    path = require('path'),
    Promise = require('bluebird'),
    slugify = require('slug'),
    knex = require('./db/knex'),
    randomString = require('random-string');

function Gallery() {
    return knex('gallery');
}
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'mhottman',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const UPLOAD_DIR =  path.resolve(__dirname, "./public/uploads");


var uploader = {
    upload: function(request) {
        return new Promise(function(resolve, reject) {


            //check if uploads dir exists
            fs.lstat(UPLOAD_DIR, function(err, stats) {
                if (!err) {
                    if (stats.isDirectory()) {
                        doUpload(request);
                    } else {
                        createDir(doUpload);
                    }
                } else {
                    createDir(doUpload);
                }
            });

            function createDir(callback) {
                fs.mkdir(UPLOAD_DIR, function() {
                    return callback(request);
                });
            }

            function doUpload(request) {
                //form setup
                var form = new formidable.IncomingForm();
                    form.uploadDir = UPLOAD_DIR;
                    form.keepExtensions = true;
                    form.multiples = true;

                form.on('end', function() {

                    this.openedFiles.forEach(function(file, index) {
                        var ext = file.path.substring(file.path.lastIndexOf('.'), file.path.length);
                        var slug = randomString({
                            length: 12,
                            numeric: false,
                            letters: true,
                            special: false
                        });

                        slug = slugify(slug, '_').toLowerCase();

                        var image_path = path.resolve(UPLOAD_DIR+'/'+slug+ext);
                        fs.rename(file.path, image_path, function(err) {
                            if (err) {reject(err);}
                        });

                        file.name = slug+ext;
                        file.ext = ext;
                        file.path = file.path.substring(0, file.path.lastIndexOf('/') + 1) + slug + ext;
                    });
                });

                form.parse(request, function (err, fields, files) {

                    files = files.files;

                    var returnData = {
                        images: [],
                        formData: fields
                    };

                    if (!files.length) {
                        //if only one file uploaded, ensure it is an array
                        files = [files];
                    }

                    files.forEach(function(file) {
                        var imgData = {
                            fullpath: file.path,
                            type: file.ext,
                            file: file.name
                        };
                        returnData.images.push(imgData);
                    });

                    return resolve(returnData);
                });
            }
        });
    },
    toCloud: function(files) {
        return new Promise(function(resolve, reject) {
            var results = [], done = 0;
            files.forEach(function(file) {
                cloudinary.uploader.upload(file.fullpath, function(result) {
                    results.push(result);
                    ++done;
                    if (done === files.length) {
                        // console.log("file: ", file.fullpath);
                        return resolve(results);
                    }
                });
            });
        });
    },
    toDatabase: function(data) {
        return new Promise(function(resolve, reject) {
            Gallery().insert({
                slug: data.slug,
                img_url: data.img_url,
                cloudinary_id: data.cloudinary_id
            }).then(resolve).catch(reject);
        });
    },
    removeFromDir: function(file, callback) {
        fs.unlink(UPLOAD_DIR+"/"+file, function(err, success) {
            return callback(err, success);
        });
    },
    deleteDir: function(callback) {
        fs.rmdir(UPLOAD_DIR, function(err, success) {
            return callback(err, success);
        });
    }
};



module.exports = uploader;
