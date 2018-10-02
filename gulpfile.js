const gulp = require('gulp');
const clean = require('gulp-clean');
const Vinyl = require('vinyl');
const fs = require('fs');
const raster = require('gulp-raster');
const rename = require('gulp-rename');
const shell = require('gulp-shell');
const dir = require('node-dir');
const gm = require('gm');

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

gulp.task('generate', ['clean'], function () {
    return generate('test', {
        '1.svg': fs.readFileSync('./base.svg').toString().split('#ffff00').join('#ffff00'),
        '2.svg': fs.readFileSync('./base.svg').toString().split('#ffff00').join('#00ff00')
    })
    .pipe(raster({format: 'png', scale: 1}))
    .pipe(rename({extname: '.png'}))
    .pipe(gulp.dest('dest/'))
    .pipe(shell([
        'echo <%= file.path %>'
    ]));
});

gulp.task('default', ['clean', 'generate'], function () {
    const files = dir.files('./dest', {sync:true})

    var g = gm();
    files.forEach(function(file){
        g.montage(file);
    });
    g.write('./dest/result.png', function(err) {
        if(!err) console.log("Written montage image.");
    });
});
