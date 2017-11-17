/* globals console */

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

const jsZepto = srcJs+'_zepto/zepto.js';

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
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Gulp modules

const gulp = require('gulp'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    addsrc = require('gulp-add-src'),
    insert = require('gulp-insert'),
    notify = require('gulp-notify'),

    // CSS / SCSS
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),

    // JS
    jshint = require('gulp-jshint'),
    // buble = require('gulp-buble'),
    rollup = require('gulp-better-rollup'),
    uglify = require('gulp-uglify'),
    rollupBuble = require('rollup-plugin-buble');


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// CSS / SCSS

gulp.task('styles', () =>  {
    return gulp.src(srcScss+'*.scss')
        .pipe(sass({ style: 'expanded' }).on('error', sass.logError))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest(destCss))
        .pipe(notify({ message: 'Styles task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts - without Zepto
// - requires jQuery or Zepto

gulp.task('scripts:core', () =>  {

    return gulp.src(srcJs+'main.js')
        // .pipe(sourcemaps.init())
        .pipe(rollup({
            plugins: [rollupBuble(bubleConfig)],
        }, {
            format: 'umd',
            name : 'Curator'
        }))
        .on('error', bubleError)

        // .pipe(sourcemaps.write()) // inlining the sourcemap into the exported .js file
        .pipe(rename('curator.core.js'))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:core task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts - bundled Curator and Zepto

gulp.task('scripts:bundle', ['scripts:core'], () =>  {

    return gulp.src(jsZepto)
        .pipe(insert.append(';')) // missing ;
        .pipe(addsrc.append(destJs+'curator.core.js'))

        // .pipe(sourcemaps.write()) // inlining the sourcemap into the exported .js file
        // .pipe(addsrc.prepend(jsZepto))
        .pipe(concat('curator.js'))
        .pipe(gulp.dest(destJs))
        .pipe(notify({ message: 'scripts:all task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts - lint core scripts

gulp.task('scripts:lint', () =>  {

    return gulp.src(srcJs+'core/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(notify({ message: 'scripts:lint task complete' }));
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Scripts - create minimized production sripts

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
    'scripts:core',
    'scripts:bundle'
]);
gulp.task('prod', ['scripts:prod']);
gulp.task('default', ['styles','scripts']);