const gulp = require('gulp');
const clean = require('gulp-clean');
const Vinyl = require('vinyl');
const fs = require('fs');

function generate(base, files) {
    const src = require('stream')
        .Readable({ objectMode: true });

    src._read = function () {
        const that = this;

        Object.keys(files).forEach(function(key) {
            that.push(new Vinyl({
                cwd: '/',
                base: '/test/',
                path: '/test/' + key,
                contents: new Buffer(files[key])
            }))
        });

        this.push(null)
    }

    return src
}

gulp.task('clean', function () {
  return gulp.src('dest/*', {read: false})
    .pipe(clean());
});

gulp.task('default', ['clean'], function () {
    return generate('test', {
        '1.svg': fs.readFileSync('./base.svg').toString().split('#ffff00').join('#ffff00'),
        '2.svg': fs.readFileSync('./base.svg').toString().split('#ffff00').join('#00ff00')
    })
    .pipe(gulp.dest('dest/'));
});
