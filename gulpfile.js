
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Configuration


var dest        = "dist/";
var destCss     = dest+"css/";
var destJs      = dest+"js/";

var src         = "src/";
var srcScss     = src+"scss/";
var srcJs       = src+"js/";

var watchPaths  = [
    dest+'/**',
    'tests/**/*.html'
];

var jsHintConfig = {

};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Gulp modules

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    jshint = require('gulp-jshint'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    umd = require('gulp-umd'),
    notify = require('gulp-notify');


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// CSS / SCSS

gulp.task('styles', function() {
    return gulp.src(srcScss+'*.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(destCss))
        .pipe(notify({ message: 'Styles task complete' }))
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Core files

gulp.task('scripts:core', function() {
    return gulp.src([
            srcJs+'library/**/*.js'
        ])
        .pipe(concat('curator.core.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:core task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Waterfall
//
// gulp.task('scripts:widget:waterfall:base', ['scripts:core'], function() {
//     return gulp.src([
//             srcJs+'widgets/waterfall/**/*.js'
//         ])
//         .pipe(jshint.reporter('default'))
//         .pipe(concat('curator.waterfall.js'))
//         .pipe(gulp.dest(destJs))
//         .pipe(notify({ message: 'scripts:widget:waterfall:base task complete' }));
// });

gulp.task('scripts:widget:waterfall', ['scripts:core'], function() {
    return gulp.src([
            destJs+'curator.core.js',
            srcJs+'widgets/_vendor/grid-a-licious.js',
            srcJs+'widgets/waterfall.js'
        ])
        .pipe(concat('curator.widget.waterfall.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:widget:waterfall task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Carousel

gulp.task('scripts:widget:carousel:noslick', ['scripts:core'], function() {
    return gulp.src([
            destJs+'curator.core.js',
            srcJs+'widgets/carousel.js'
        ])
        .pipe(concat('curator.widget.carousel.noslick.js'))
        .pipe(umd({
            dependencies: function(file) {
                return [
                    {
                        amd: 'jquery',
                        global: 'jQuery',
                        param: 'jQuery'
                    },
                    {
                        name: 'slick',
                        param: 'slick'
                    }
                ];
            },
            exports: function(file) {
                return 'Curator';
            },
            namespace: function(file) {
                return 'Curator';
            }
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:widget:carousel:noslick task complete' }));
});

gulp.task('scripts:widget:carousel', ['scripts:core'], function() {
    return gulp.src([
            srcJs+'vendor/slick.js',
            destJs+'curator.core.js',
            srcJs+'widgets/carousel.js'
        ])
        .pipe(concat('curator.widget.carousel.js'))
        .pipe(umd({
            exports: function(file) {
                return 'Curator';
            },
            namespace: function(file) {
                return 'Curator';
            }
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:widget:carousel task complete' }));
});


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Panel


gulp.task('scripts:widget:panel', ['scripts:core'], function() {
    return gulp.src([
            srcJs+'vendor/slick.js',
            destJs+'curator.core.js',
            srcJs+'widgets/panel.js'
        ])
        .pipe(concat('curator.widget.panel.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:widget:panel task complete' }));
});


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Custom

gulp.task('scripts:widget:custom', ['scripts:core'], function() {
    return gulp.src([
            destJs+'curator.core.js',
            srcJs+'widgets/custom.js'
        ])
        .pipe(concat('curator.widget.custom.js'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:widget:custom task complete' }));
});


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts Production

gulp.task('scripts:prod', function() {
    return gulp.src(srcJs+'**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(destJs))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'Scripts & Minify task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Watch

gulp.task('watch', function() {
    console.log ('Watching: '+srcScss+'*.scss');
    gulp.watch(srcScss+'/**/*.scss', ['styles']);

    // Watch .js files
    console.log ('Watching: '+srcJs+'**/*.js');
    gulp.watch(srcJs+'**/*.js', ['scripts']);

    // Create LiveReload server
    livereload.listen();

    // Watch any files in dist/, reload on change
    gulp.watch(watchPaths).on('change', livereload.changed);
});

gulp.task('dev', ['watch']);
gulp.task('scripts', [
    // 'scripts:widget:waterfall',
    // 'scripts:widget:carousel',
    'scripts:widget:carousel:noslick',
    // 'scripts:widget:panel',
    // 'scripts:widget:custom'
]);
gulp.task('prod', ['styles:prod','scripts:prod']);
gulp.task('default', ['styles','scripts']);