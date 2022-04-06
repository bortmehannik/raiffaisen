const {
    src,
    dest
} = require('gulp');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const map = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const bs = require('browser-sync');

module.exports = function js() {
    return src('src/js/**/*.js')
        .pipe(map.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(map.write('./sourcemaps'))
        .pipe(dest('build/js'))
        .pipe(bs.stream())
}
