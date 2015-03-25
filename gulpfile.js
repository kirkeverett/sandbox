var gulp = require('gulp'),
    browserify = require('browserify'),
    refresh = require('gulp-livereload'),
    lrserver = require('tiny-lr')(),
    del = require('del'),
    source = require('vinyl-source-stream'),
    browserSync = require('browser-sync'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    spritesmith = require("gulp.spritesmith");

gulp.task('clean', function () {
    del(['deploy/**']);
    del(['built/**']);
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

gulp.task('media', function() {
    return gulp.src('./media/*.wav')
        .pipe(gulp.dest('./deploy/media'))
        .pipe(refresh(lrserver));
});

gulp.task('css', ['sprite'], function() {
   return  gulp.src(['./node_modules/bootstrap/dist/css/bootstrap.min.css',  './built/css/sprite.css', './css/styles.css'])
        .pipe(concat('combined.css'))
        .pipe(gulp.dest('./deploy/css'))
        .pipe(refresh(lrserver));
});

gulp.task('sprite', function() {
    var spriteData =
        gulp.src('./src/img/sprite/*.*') // source path of the sprite images
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: 'sprite.css'
            }));

    spriteData.img.pipe(gulp.dest('./deploy/css/')); // output path for the sprite
   return spriteData.css.pipe(gulp.dest('./built/css/')); // output path for the CSS
});



gulp.task('build', function() {
    gulp.run('css', 'html', 'scripts','media');
});

gulp.task('serve',  function() {

    browserSync({
        server: "./deploy"
    });

    gulp.watch("deploy/*.html").on('change',  browserSync.reload);
    gulp.watch("deploy/*.js").on('change',  browserSync.reload);
    gulp.watch("deploy/css/*.css").on('change',  browserSync.reload);
    gulp.watch("deploy/src/img/sprite/*.png").on('change',  browserSync.reload);
    gulp.watch("deploy/media/*.wav").on('change',  browserSync.reload);

});


gulp.task('watch', ['build','serve'], function() {
    gulp.watch('src/*.js', ['scripts']);
    gulp.watch('src/*.html', ['html']);
    gulp.watch('css/*.css', ['css']);
    gulp.watch('media/*.wav', ['media']);
    gulp.watch('src/img/sprite/*.png', ['sprite']);
});

gulp.task('default', ['clean','build']);


gulp.task('serveprod', ['build'], function() {
    connect.server({
        root: "./deploy",
        port: process.env.PORT || 5000, // localhost:5000
        livereload: false
    });
});