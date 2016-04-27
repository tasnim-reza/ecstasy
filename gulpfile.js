/**
 * Created by tasnim.reza on 28-Mar-16.
 */
// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),

    streamSeries = require('stream-series');
    inject = require('gulp-inject');


// Copy vendor files
var vendorFiles = gulp.src(['node_modules/jquery/dist/jquery.min.js',
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/angular/angular.min.js'])
    .pipe(gulp.dest('dist/vendor'));

// Concatenate & Minify application js files
var appFile = gulp.src(['src/**/*.js'])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('all.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));

gulp.task('scripts', function () {
    appFile, vendorFiles
});


var appCss = gulp.src('src/css/**')
    .pipe(gulp.dest('dist/css'));

var vendorCss = gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest('dist/vendor'));

// Copy all static assets
gulp.task('copy', function () {
    appCss;
    vendorCss;

    gulp.src('src/img/**')
        .pipe(gulp.dest('dist/img'));

    gulp.src('src/**/*.html')
        .pipe(gulp.dest('dist'));
});

gulp.task('inject', function () {
    gulp.src('dist/index.html')
        .pipe(inject(streamSeries(vendorFiles, appFile, vendorCss, appCss), {relative: true}))
        .pipe(gulp.dest('dist'));
})

// Watch Files For Changes
gulp.task('watch', function () {
    gulp.watch('js/*.js', ['lint', 'scripts']);
});

//build task
gulp.task('build', ['scripts', 'copy']);

// Default Task
gulp.task('default', ['lint', 'scripts', 'watch']);