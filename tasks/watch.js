const {
    watch,
    parallel,
    series
} = require('gulp');

module.exports = function watching() {
    watch('src/fonts/**/*.{ttf,otf,woff,woff2}', parallel('fonts'));
    watch('src/**/*.css', parallel('style', 'css'));
    watch('src/**/*.js', series('js'));
    watch('src/**/*.html', series('html'));
    watch('src/icons/**/*.svg', parallel('svg'));
    watch('src/image/**/*.+(png|jpg|jpeg|gif)', series('image'));
}
