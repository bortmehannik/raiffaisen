const bs = require('browser-sync');

module.exports = function browserSync() {
    bs.init({
        server: {
            baseDir: 'build/',
            online: true
        },
        host: '127.0.0.1',
        port: '3021',
    })
}
