
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
    'tests/**/*.html',
    'examples/**/*.html'
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
    addsrc = require('gulp-add-src'),
    notify = require('gulp-notify');

var umdTemplate = ";(function(root, factory) {\n\
if (typeof define === 'function' && define.amd) {\n\
    // Cheeky wrapper to add root to the factory call\n\
    var factoryWrap = function () { \n\
        var argsCopy = [].slice.call(arguments); \n\
        argsCopy.unshift(root);\n\
        return factory.apply(this, argsCopy); \n\
    };\n\
    define(<%= amd %>, factoryWrap);\n\
} else if (typeof exports === 'object') {\n\
    module.exports = factory(root, <%= cjs %>);\n\
} else {\n\
    root.<%= namespace %> = factory(root, <%= global %>);\n\
}\n\
}(this, function(root, <%= param %>) {\n\
<%= contents %>\n\
    return <%= exports %>;\n\
}));\n";


var umdRequireJQuery = {
    name: 'jQuery',
    amd: 'jquery',
    cjs: 'jquery',
    global: 'jQuery',
    param: 'jQuery'
};
var umdRequireCurator = {
    name: 'Curator',
    amd: 'curator',
    cjs: 'curator',
    global: 'Curator',
    param: 'Curator'
};
var umdRequireSlick = {
    name: 'slick',
    amd: 'slick',
    cjs: 'slick',
    global: 'slick',
    param: 'slick'
};


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// CSS / SCSS

gulp.task('styles', function() {
    return gulp.src(srcScss+'*.scss')
        .pipe(sass({ style: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(destCss))
        .pipe(notify({ message: 'Styles task complete' }))
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Core files

gulp.task('scripts:core', function() {
    return gulp.src([
            srcJs+'core/_vendor/*.js',
            srcJs+'core/**/*.js'
        ])
        .pipe(concat('curator.core.js'))
        .pipe(umd({
            dependencies: function(file) {
                return [
                    umdRequireJQuery
                ];
            },
            exports: function(file) {
                return 'Curator';
            },
            namespace: function(file) {
                return 'Curator';
            },
            templateSource:umdTemplate
        }))

        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        //.pipe(jshint.reporter('fail')) 

        .pipe(gulp.dest(destJs))

        .pipe(notify({ message: 'scripts:core task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Waterfall

gulp.task('scripts:waterfall', ['scripts:core'], function() {
    return gulp.src([
            srcJs+'widgets/waterfall.js'
        ])
        .pipe(concat('curator.waterfall.js'))
        .pipe(umd({
            dependencies: function(file) {
                return [
                    umdRequireJQuery,
                    umdRequireCurator
                ];
            },
            exports: function(file) {
                return 'Client';
            },
            namespace: function(file) {
                return 'Curator.Waterfall';
            },
            templateSource:umdTemplate
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))
        
        // Save Curator.Waterfall
        .pipe(gulp.dest(destJs))

        // Save our widget - combines Curator, Curator.Waterfall and Grid-a-licious
        .pipe(addsrc.prepend([
            srcJs+'widgets/_vendor/jquery.grid-a-licious.js',
            destJs+'curator.core.js'
        ]))
        .pipe(concat('curator.widget.waterfall.js'))
        .pipe(gulp.dest(destJs))

        .pipe(notify({ message: 'scripts:widget:waterfall task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Carousel

gulp.task('scripts:carousel', ['scripts:core'], function() {
    return gulp.src([
            srcJs+'widgets/carousel.js'
        ])
        .pipe(concat('curator.carousel.js'))
        .pipe(umd({
            dependencies: function(file) {
                return [
                    umdRequireJQuery,
                    umdRequireCurator,
                    umdRequireSlick
                ];
            },
            exports: function(file) {
                return 'Client';
            },
            namespace: function(file) {
                return 'Curator.Carousel';
            },
            templateSource:umdTemplate
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))

        // Save Curator.Carousel
        .pipe(gulp.dest(destJs))

        // Save our widget - combines Curator, Curator.Carousel and Slick
        .pipe(addsrc.prepend([
            srcJs+'widgets/_vendor/slick.js',
            destJs+'curator.core.js'
        ]))
        .pipe(concat('curator.widget.carousel.js'))
        .pipe(gulp.dest(destJs))
        
        .pipe(notify({ message: 'scripts:widget:carousel task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Panel

gulp.task('scripts:panel', ['scripts:core'], function() {
    return gulp.src([
            srcJs+'widgets/panel.js'
        ])
        .pipe(concat('curator.panel.js'))
        .pipe(umd({
            dependencies: function(file) {
                return [
                    umdRequireJQuery,
                    umdRequireCurator,
                    umdRequireSlick
                ];
            },
            exports: function(file) {
                return 'Client';
            },
            namespace: function(file) {
                return 'Curator.Panel';
            },
            templateSource:umdTemplate
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))

        // Save Curator.Panel
        .pipe(gulp.dest(destJs))

        // Save our widget - combines Curator, Curator.Panel and Slick
        .pipe(addsrc.prepend([
            srcJs+'widgets/_vendor/slick.js',
            destJs+'curator.core.js'
        ]))
        .pipe(concat('curator.widget.panel.js'))
        .pipe(gulp.dest(destJs))

        .pipe(notify({ message: 'scripts:widget:panel task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widget Custom

gulp.task('scripts:custom', ['scripts:core'], function() {
    return gulp.src([
            srcJs+'widgets/custom.js'
        ])
        .pipe(concat('curator.custom.js'))
        .pipe(umd({
            dependencies: function(file) {
                return [
                    umdRequireJQuery,
                    umdRequireCurator
                ];
            },
            exports: function(file) {
                return 'Client';
            },
            namespace: function(file) {
                return 'Curator.Custom';
            },
            templateSource:umdTemplate
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))

        // Save Curator.Custom
        .pipe(gulp.dest(destJs))

        // Save our widget - combines Curator and Curator.Custom
        .pipe(addsrc.prepend([
            destJs+'curator.core.js'
        ]))
        .pipe(concat('curator.widget.custom.js'))
        .pipe(gulp.dest(destJs))

        .pipe(notify({ message: 'scripts:widget:custom task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widgets Combined

gulp.task('scripts:combined', ['scripts:core','scripts:waterfall','scripts:carousel','scripts:panel','scripts:custom'], function() {
    return gulp.src([
            srcJs+'widgets/_vendor/jquery.grid-a-licious.js',
            srcJs+'widgets/_vendor/slick.js',
            destJs+'curator.core.js',
            destJs+'curator.waterfall.js',
            destJs+'curator.carousel.js',
            destJs+'curator.panel.js',
            destJs+'curator.custom.js'
        ])
        .pipe(concat('curator.js'))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:combined task complete' }));
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
    'scripts:waterfall',
    'scripts:carousel',
    'scripts:panel',
    'scripts:custom',
    'scripts:combined'
]);
gulp.task('prod', ['styles:prod','scripts:prod']);
gulp.task('default', ['styles','scripts']);