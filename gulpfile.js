"use strict";

var gulp         = require('gulp'),
	pug          = require('gulp-pug'),
	sass         = require('gulp-sass'),
	concat       = require('gulp-concat'),
	plumber      = require('gulp-plumber'),
	autoprefixer = require('autoprefixer'),
	postcss      = require('gulp-postcss'),
	mqpacker     = require('css-mqpacker'),
    csso         = require('postcss-csso'),
	imagemin     = require('gulp-imagemin'),
	browserSync  = require('browser-sync').create();

var processors = [
    autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
    }),
    require('lost'),
    mqpacker({
        sort: sortMediaQueries
    })
	//,
    //csso //вкл-выкл оптимизирование в одну строку
];

var useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	cssmin = require('gulp-clean-css'),
	uglify = require('gulp-uglify'),
	rimraf = require('rimraf'),
	notify = require('gulp-notify'),
	ftp    = require('vinyl-ftp');

var paths = {
			blocks: 'blocks/',
			devDir: 'app/',
			outputDir: 'build/'
		};

/*********************************
              APP
*********************************/

//pug compile
gulp.task('pug', function() {
	return gulp.src([paths.blocks + '*.pug', '!' + paths.blocks + 'mixins.pug' ])
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest(paths.devDir))
		.pipe(browserSync.stream())
});

//sass compile
gulp.task('sass', function() {
	return gulp.src(paths.blocks + '*.sass')
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
		.pipe(gulp.dest(paths.devDir + 'css/'))
		.pipe(browserSync.stream());
});

function isMax(mq) {
    return /max-width/.test(mq);}
function isMin(mq) {
    return /min-width/.test(mq);}
function sortMediaQueries(a, b) {
    var A = a.replace(/\D/g, '');
    var B = b.replace(/\D/g, '');
    if (isMax(a) && isMax(b)) {
        return B - A;} else if (isMin(a) && isMin(b)) {
        return A - B;} else if (isMax(a) && isMin(b)) {
        return 1;} else if (isMin(a) && isMax(b)) {
        return -1;}
    return 1;}

//js compile
gulp.task('scripts', function() {
	return gulp.src([
			paths.blocks + '**/*.js',
            paths.blocks + '**/**/*.js',
			'!' + paths.blocks + '_assets/*.js'
		])
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.devDir + 'js/'))
		.pipe(browserSync.stream());
});

//watch
gulp.task('watch', function() {
	gulp.watch(paths.blocks + '**/*.pug', ['pug']);
	gulp.watch(paths.blocks + '**/*.sass', ['sass']);
	gulp.watch(paths.blocks + '**/*.js', ['scripts']);
});

//server
gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: paths.devDir
		}
	});
});

/*********************************
             BUILD
*********************************/

//clean
gulp.task('clean', function(cb) {
	rimraf(paths.outputDir, cb);
});

//css + js
gulp.task('build-all', ['clean'], function () {
	return gulp.src(paths.devDir + '*.html')
		.pipe( useref() )
		.pipe( gulpif('*.js', uglify()) )
		.pipe( gulpif('*.css', cssmin()) )
		.pipe( gulp.dest(paths.outputDir) );
});

//copy images to outputDir
gulp.task('imgBuild', ['clean'], function() {
	return gulp.src(paths.devDir + 'img/**/*.*')
		.pipe(imagemin())
		.pipe(gulp.dest(paths.outputDir + 'img/'));
});

//copy fonts to outputDir
gulp.task('fontsBuild', ['clean'], function() {
	return gulp.src(paths.devDir + '/fonts/*')
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
});
//copy if-IE-js to outputDir
gulp.task('IEjsBuild', ['clean'], function() {
    return gulp.src(paths.devDir + '/js/*')
        .pipe(gulp.dest(paths.outputDir + 'js/'));
});

//default
gulp.task('default', ['browser-sync', 'watch', 'pug', 'sass', 'scripts']);

//build
gulp.task('build', ['build-all', 'imgBuild', 'fontsBuild', 'IEjsBuild']);
