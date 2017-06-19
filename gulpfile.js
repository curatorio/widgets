
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
    'examples/**/*.html',
    'examples/js/*.js',
    'examples/css/*.css',
];

const jsHintConfig = {

};

const bubleConfig = {
    transforms: {
        dangerousForOf: true
    }
};

function bubleError (err) {
    console.log('[Buble ERROR]');
    console.log(err.fileName + ( err.loc ? '( '+err.loc.line+', '+err.loc.column+' ): ' : ': '));
    console.log('error: ' + err.message + '\n');
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
    buble = require('gulp-buble');


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// CSS / SCSS

gulp.task('styles', () =>  {
    return gulp.src(srcScss+'*.scss')
        .pipe(sass({ style: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(destCss))
        .pipe(notify({ message: 'Styles task complete' }))
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts

gulp.task('scripts:all', () =>  {
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
        .pipe(buble(bubleConfig))
        .on('error', bubleError)
        .pipe(addsrc.prepend([
            srcJs+'widgets/_vendor/zepto.js',
            srcJs+'widgets/_vendor/zepto.scope.js',
            srcJs+'widgets/_vendor/zepto.animate.js',
            srcJs+'widgets/_vendor/zepto.extend.js',
            srcJs+'widgets/_vendor/zepto.fxmethods.js',
        ]))
        .pipe(concat('curator.js'))
        .pipe(wrap({ src: src+'umd-templates/all.js'}))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:nodep task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts - without Zepto
// - requires jQuery or Zepto

gulp.task('scripts:core', () =>  {
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
        .pipe(buble(bubleConfig))
        .on('error', bubleError)
        .pipe(concat('curator.core.js'))
        .pipe(wrap({ src: src+'umd-templates/core.js'}))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:combined task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts Production

gulp.task('scripts:prod', ['scripts'], () =>  {
    return gulp.src([destJs+'curator.js',destJs+'curator.core.js'])
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest(destJs))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'Scripts & Minify task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Watch

gulp.task('watch', () =>  {
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
    'scripts:all',
    'scripts:core'
]);
gulp.task('prod', ['scripts:prod']);
gulp.task('default', ['styles','scripts']);