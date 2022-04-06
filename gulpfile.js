const gulp = require('gulp');
const requireDir = require('require-dir');
const tasks = requireDir('./tasks');

exports.fonts = tasks.fonts;
exports.html = tasks.html;
exports.style = tasks.style;
exports.css = tasks.css;
exports.js = tasks.js;
exports.image = tasks.image;
exports.svg = tasks.svg;
exports.browserSync = tasks.browserSync;
exports.clean = tasks.clean;
exports.watch = tasks.watch;

exports.default = gulp.series(
    exports.clean,
    gulp.parallel(
        exports.fonts,
        exports.html,
        exports.style,
        exports.css,
        exports.js,
        exports.image,
        exports.svg,
    )
);

exports.watch = gulp.series(
    gulp.parallel(
        exports.fonts,
        exports.html,
        exports.style,
        exports.css,
        exports.js,
        exports.image,
        exports.svg
    ),
    gulp.parallel(
        exports.browserSync,
        exports.watch
    )
);
