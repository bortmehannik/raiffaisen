const {
    src,
    dest
} = require('gulp');
const prefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean-css');
const concat = require('gulp-concat');
const map = require('gulp-sourcemaps');
const bs = require('browser-sync');

module.exports = function style() {
    return src('src/css/general/*.css')
        .pipe(map.init())
        .pipe(prefixer({
            overrideBrowserslist: ['last 10 versions'],
            browsers: [
                'Android >= 4',
                'Chrome >= 20',
                'Firefox >= 24',
                'Explorer >= 11',
                'iOS >= 6',
                'Opera >= 12',
                'Safari >= 6',
            ],
        }))
        .pipe(clean({
            level: 2
        }))
        .pipe(concat('general.min.css'))
        .pipe(map.write('./sourcemaps'))
        .pipe(dest('build/css'))
        .pipe(bs.stream())
}
