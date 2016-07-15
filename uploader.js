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

                // form.on('fileBegin', function(name, file) {
                //     console.log("file: ", file.size);
                // });
                form.on('end', function() {
                    var image_path = path.resolve(UPLOAD_DIR+'/'+this.openedFiles[0].name);
                    fs.rename(this.openedFiles[0].path, image_path, function(err) {
                        if (err) {reject(err);}
                    });
                });
                form.parse(request, function (err, fields, files) {
                    files = files.files;

                    var ext = files.name.substring(files.name.indexOf('.'), files.name.length);
                    var slug = randomString({
                        length: 12,
                        numeric: false,
                        letters: true,
                        special: false
                    });

                    slug = slugify(slug, '_').toLowerCase();

                    var newPath = path.resolve(UPLOAD_DIR+"/"+slug+ext);
                    fs.rename(UPLOAD_DIR+"/"+files.name, newPath, function(err) {
                        if (err) {reject(err);}
                    });

                    //assign slug for db
                    fields.slug = slug;

                    resolve({
                        image: {
                            fullpath: newPath,
                            type: ext,
                            file: slug+ext,
                            name: fields.title
                        },
                        formData: fields
                    });
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
                title: data.upload.formData.title,
                slug: data.upload.formData.slug,
                img_url: data.cloud.url,
                isFeatured: data.upload.formData.isFeatured || false
            }).then(resolve).catch(reject);
        });
    },
    removeFromDir: function(data) {
        return new Promise(function(resolve, reject) {
            fs.unlink(UPLOAD_DIR+"/"+data.image.file, function(err, success) {
                if (err) {reject(err);}
                fs.rmdir(UPLOAD_DIR, function(err, success) {
                    if (err) {reject(err);}
                    resolve(success);
                })
            });
        });
    }
};



module.exports = uploader;
