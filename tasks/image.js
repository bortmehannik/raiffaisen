const {
    src,
    dest
} = require('gulp');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');
const recompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const bs = require('browser-sync');
const plumber = require('gulp-plumber');

module.exports = function image() {
    return src('src/image/**/*.+(png|jpg|jpeg|webp|avif|gif|svg)')
        .pipe(plumber())
        .pipe(changed('build/image'))
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 5,
        }, [
            recompress({
                loops: 6,
                min: 50,
                max: 90,
                quality: 'high',
                use: [pngquant({
                    quality: [0.8, 1],
                    strip: true,
                    speed: 1
                })],
            }),
            imagemin.gifsicle(),
            imagemin.optipng()
        ], ), )
        .pipe(dest('build/image'))
        .pipe(bs.stream())
}
