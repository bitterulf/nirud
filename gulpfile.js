const gulp = require('gulp');
const clean = require('gulp-clean');
const Vinyl = require('vinyl');
const fs = require('fs');
const raster = require('gulp-raster');
const rename = require('gulp-rename');
const shell = require('gulp-shell');
const dir = require('node-dir');
const gm = require('gm');
const jimp = require('gulp-jimp');
const childProcess = require('child_process');

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
        '1.svg': fs.readFileSync('./icon.svg').toString().split('#00ff00').join('#ff0000'),
        '2.svg': fs.readFileSync('./icon.svg').toString().split('#00ff00').join('#00ff00'),
        '3.svg': fs.readFileSync('./icon.svg').toString().split('#00ff00').join('#0000ff'),
        '4.svg': fs.readFileSync('./icon.svg').toString().split('#00ff00').join('#00ffff'),
        '5.svg': fs.readFileSync('./icon.svg').toString().split('#00ff00').join('#ff00ff'),
        '6.svg': fs.readFileSync('./icon.svg').toString().split('#00ff00').join('#ffff00'),
    })
    .pipe(raster({format: 'png', scale: 1}))
    .pipe(rename({extname: '.png'}))
    .pipe(jimp({
        '-1': {
            opacity: 0.2,
            type: 'png'
        },
        '-2': {
            opacity: 0.6,
            type: 'png'
        },
        '-3': {
            opacity: 1,
            type: 'png'
        }
    }))
    .pipe(gulp.dest('dest/'))
    .pipe(shell([
        'gmic -i <%= file.path %> -gimp_cpencil 1.3,50,20,2,2,1,0 -gimp_graphic_novelfxl 1,2,6,5,20,0,0.62,14,0,1,0.5,0.78,1.92,0,0,0,1,1,1,0.5,0.8,1.28 -o <%= file.path %>'
    ]));
});

gulp.task('default', ['clean', 'generate'], function () {
    childProcess.exec('gm montage -mode concatenate -tile 3x -background none ./dest/*.png ./dest/out.png');
});
