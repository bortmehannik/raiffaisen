const {
    src,
    dest
} = require('gulp');
const changed = require('gulp-changed');
const svgo = require('gulp-svgo');
const bs = require('browser-sync');

module.exports = function svg() {
    return src('src/icons/**/*')
        .pipe(changed('build/icons'))
        .pipe(svgo())
        .pipe(dest('build/icons'))
        .pipe(bs.stream())
}
