var gulp = require('gulp'),
    babel = require('gulp-babel'),
    gutil = require('gulp-util'),
    uglify  = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean');

/*静态服务器 + 监听 js 文件*/
gulp.task('server', ['js'], function() {
    gulp.watch("./src/*.js", ['js']);
});

/*js*/
gulp.task('js',function(){
    gulp.src(['sdk.js'])
        .pipe(babel({
            presets: ['es2015'] // es5检查机制
        }))
        .pipe(uglify({
            mangle: true,
            compress: false,
            preserveComments: 'license'
        }))
        .on('error', function(err) {
            gutil.log(gutil.colors.red('[Error]'), err.toString());
        })
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('default', ['server'])
