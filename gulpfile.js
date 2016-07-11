'use strict';
var gulp = require('gulp');
var path = require('path');

//js
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
//css
var compass = require('gulp-compass'),
   autoprefixer = require('gulp-autoprefixer'),
   minifycss  = require('gulp-cssnano'),
   gutil = require('gulp-util');

const JS_SOURCE_DIR = path.resolve(__dirname, './src/**/*.js');
const JS_BUILD_DIR = path.resolve(__dirname, './public/js');
const CSS_SOURCE_DIR = path.resolve(__dirname, './src/styles/**/*.scss');
const CSS_BUILD_DIR = path.resolve(__dirname, './public/css');


gulp.task('watch', ['css', 'js'], function() {
    gulp.watch(CSS_SOURCE_DIR, ['css']);
    gulp.watch(JS_SOURCE_DIR, ['js']);
});

gulp.task('js', function () {
    return gulp.src([JS_SOURCE_DIR])
        .on('error', function(err) {
            this.emit('end');
            console.error("Err in bundle: ", err);
        })
        .pipe(browserify())
        // .pipe(uglify())
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest(JS_BUILD_DIR));
});

gulp.task('css', function() {
   return gulp.src(CSS_SOURCE_DIR)
      .pipe(compass({
         sass     : './src/styles',
         css      : CSS_BUILD_DIR,
         logging  : true,
         comments : true,
      }))
      .on('error', function(err) {
         gutil.log("Gulp Error in 'Development Task'", err.toString());
         this.emit('end'); //resumes watch after error
      })
      .pipe(autoprefixer())
      .pipe(gulp.dest(CSS_BUILD_DIR));
});
