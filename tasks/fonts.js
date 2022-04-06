const gulp = require('gulp');

module.exports = function fonts() {
    return gulp.src('src/**/*.{ttf,otf,woff,woff2}')
        .pipe(gulp.dest('build'));
};
