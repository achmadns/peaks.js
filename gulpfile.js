'use strict';
var deamdify = require('gulp-deamdify');
var path = require('path');
var browserSync = require('browser-sync').create();
var browserify = require('browserify');
var derequire = require('gulp-derequire');
var exorcist = require('exorcist');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var transform = require('vinyl-transform');
var gutil = require('gulp-util');
var exec = require('gulp-exec');
var mapfile = path.join(__dirname, 'peaks.js.map');
var exec = require('child_process').exec;
var reload = browserSync.reload;
var multiProcess = require('gulp-multi-process');

gulp.task('build', function() {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: 'src/main.js',
    debug: true,
    standalone: 'peaks',
    transform: ['deamdify']
  });

  var browserified = transform(function(filename) {
    return browserify({
      entries: 'src/main.js',
      debug: true,
      standalone: 'peaks',
      transform: ['deamdify']
    }).bundle();
  });

  return b.bundle()
    .pipe(source('src/main.js'))
    .pipe(buffer())
    // Add transformation tasks to the pipeline here.
    // .pipe(uglify())
    .on('error', gutil.log)
    // .pipe(sourcemaps.write('./'))
    .pipe(exorcist(mapfile))
    // .pipe(derequire())
    .pipe(gulp.dest('./'));
});

gulp.task('package', function(cb) {
  exec('browserify -d -e ./src/main.js -t deamdify -s peaks | exorcist peaks.js.map | derequire - > peaks.js', function(err, stdout, stderr) {
    cb(err);
  });
});

gulp.task('watch', ['package'], function() {
  gulp.watch('src/**/*.js', ['package']);
});

// Save a reference to the `reload` method

// Watch scss AND html files, doing different things with each.
gulp.task('serve', function() {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
  gulp.watch(['*.html', 'peaks.js']).on('change', reload);
});

gulp.task('default', function(cb) {
  multiProcess(['package', 'serve'], cb);
});
