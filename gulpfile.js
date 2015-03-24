var gulp = require('gulp'),
    browserify = require('browserify'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    del = require('del'),
    source = require('vinyl-source-stream'),
    less = require('gulp-less'),
    browserSync = require('browser-sync'),
    path=require('path'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat');


gulp.task('clean', function () {
    del(['deploy/**']);
});


gulp.task('scripts', function() {
    return browserify('./src/app.js')
        .bundle()
        //Pass desired output filename to vinyl-source-stream
        .pipe(source('bundle.js'))
        // Start piping stream to tasks!
        .pipe(gulp.dest('deploy'))
        .pipe(refresh(lrserver));
});

gulp.task('html', function() {
    return gulp.src('./src/*.html')
        .pipe(gulp.dest('./deploy/'))
        .pipe(refresh(lrserver));
});

gulp.task('css', function() {
   // return  gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css', './css/styles.css'])
   return  gulp.src('./css/styles.css')
        .pipe(concat('combined.css'))
        .pipe(gulp.dest('./deploy/css'))
        .pipe(refresh(lrserver));
});

gulp.task('build', function() {
    gulp.run('css', 'html', 'scripts');
});

gulp.task('serve',  function() {

    browserSync({
        server: "./deploy"
    });

    gulp.watch("deploy/*.html").on('change',  browserSync.reload);
    gulp.watch("deploy/*.js").on('change',  browserSync.reload);
    gulp.watch("deploy/*.css").on('change',  browserSync.reload);
});


gulp.task('watch', ['build','serve'], function() {
    gulp.watch('src/*.js', ['scripts']);
    gulp.watch('src/*.html', ['html']);
    gulp.watch('css/*.css', ['css']);
});

gulp.task('default', ['clean','build']);


gulp.task('serveprod', ['build'], function() {
    connect.server({
        root: "./deploy",
        port: process.env.PORT || 5000, // localhost:5000
        livereload: false
    });
});