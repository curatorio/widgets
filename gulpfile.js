
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Configuration


const dest        = "dist/";
const destCss     = dest+"css/";
const destJs      = dest+"js/";

const src         = "src/";
const srcScss     = src+"scss/";
const srcJs       = src+"js/";

const watchPaths  = [
    dest+'/**',
    'tests/**/*.html',
    'tests/**/*.css',
    'tests/**/*.js',
    'examples/**/*.html'
];

const jsHintConfig = {

};

const bubleConfig = {
    transforms: {
        dangerousForOf: true
    }
};

const babelError = function(err) {
    console.log('[BABEL ERROR]');
    console.log(err.fileName + ( err.loc ? '( '+err.loc.line+', '+err.loc.column+' ): ' : ': '));
    console.log('error Babel: ' + err.message + '\n');
    console.log(err.codeFrame);
    notify({ message: err.message });

    this.emit('end');
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Gulp modules

const gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    livereload = require('gulp-livereload'),
    wrap = require('gulp-wrap'),
    addsrc = require('gulp-add-src'),
    notify = require('gulp-notify'),

    // JS
    umd = require('gulp-umd'),
    jshint = require('gulp-jshint'),
    babel = require("gulp-babel"),
    buble = require('gulp-buble');

const umdTemplate = ";(function(root, factory) {\n\
if (typeof define === 'function' && define.amd) {\n\
    // Cheeky wrapper to add root to the factory call\n\
    const factoryWrap = function () { \n\
        const argsCopy = [].slice.call(arguments); \n\
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


const umdRequireJQuery = {
    name: 'jQuery',
    amd: 'jquery',
    cjs: 'jquery',
    global: 'jQuery',
    param: 'jQuery'
};
const umdRequireCurator = {
    name: 'Curator',
    amd: 'curator',
    cjs: 'curator',
    global: 'Curator',
    param: 'Curator'
};
const umdRequireSlick = {
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
// Widget Grid

gulp.task('scripts:grid', ['scripts:core'], function() {
    return gulp.src([
        srcJs+'widgets/grid.js'
    ])
        .pipe(concat('curator.grid.js'))
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
                return 'Curator.Grid';
            },
            templateSource:umdTemplate
        }))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', { verbose: true }))

        // Save Curator.Waterfall
        .pipe(gulp.dest(destJs))

        // Save our widget - combines Curator, Curator.Waterfall and Grid-a-licious
        .pipe(addsrc.prepend([
            destJs+'curator.core.js'
        ]))
        .pipe(concat('curator.widget.grid.js'))
        .pipe(gulp.dest(destJs))

        .pipe(notify({ message: 'scripts:widget:grid task complete' }));
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

gulp.task('scripts:combined', function() {
    return gulp.src([
        srcJs+'widgets/_vendor/smartresize.js',
        srcJs+'widgets/_vendor/waterfall-renderer.js',
        srcJs+'widgets/_vendor/carousel.js',
        // srcJs+'widgets/_vendor/owl.carousel.js',
        // srcJs+'widgets/_vendor/slick.js',
        srcJs+'core/_vendor/*.js',
        srcJs+'core/**/*.js',
        srcJs+'widgets/waterfall.js',
        srcJs+'widgets/carousel.js',
        srcJs+'widgets/panel.js',
        srcJs+'widgets/grid.js',
        srcJs+'widgets/custom.js'
    ])
    .pipe(concat('curator.js'))
    .pipe(buble(bubleConfig))
    // .on('error',babelError)
    .pipe(wrap({ src: srcJs+'templates/default.js'}))
    .pipe(gulp.dest(destJs))
    .pipe(notify({ message: 'scripts:combined task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Widgets Combined

gulp.task('scripts:nodep', function() {
    return gulp.src([
            srcJs+'widgets/_vendor/smartresize.js',
            srcJs+'widgets/_vendor/waterfall-renderer.js',
            srcJs+'widgets/_vendor/carousel.js',
            srcJs+'core/_vendor/*.js',
            srcJs+'core/**/*.js',
            srcJs+'widgets/waterfall.js',
            srcJs+'widgets/carousel.js',
            srcJs+'widgets/panel.js',
            srcJs+'widgets/grid.js',
            srcJs+'widgets/custom.js'
        ])
        .pipe(concat('curator.nodep.js'))
        .pipe(babel())
        .on('error',babelError)
        .pipe(addsrc.prepend([
            srcJs+'widgets/_vendor/zepto.js',
            srcJs+'widgets/_vendor/zepto.scope.js',
            srcJs+'widgets/_vendor/zepto.animate.js',
            srcJs+'widgets/_vendor/zepto.extend.js',
            srcJs+'widgets/_vendor/zepto.fxmethods.js',
        ]))
        .pipe(concat('curator.nodep.js'))
        .pipe(wrap({ src: srcJs+'templates/nodep.js'}))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:nodep task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts Production

gulp.task('scripts:prod', function() {
    return gulp.src([destJs+'curator.js',destJs+'curator.nodep.js'])
        .pipe(jshint.reporter('default'))
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
    // 'scripts:waterfall',
    // 'scripts:carousel',
    // 'scripts:panel',
    // 'scripts:custom',
    'scripts:nodep',
    'scripts:combined'
]);
gulp.task('prod', ['styles:prod','scripts:prod']);
gulp.task('default', ['styles','scripts']);