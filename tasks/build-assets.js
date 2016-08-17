'use strict'

const gulp = require('gulp')

gulp.task('build:assets', function () {
  return gulp.src('assets/**/*')
    .pipe(gulp.dest('./build'))
})

// Potentially handle other html files in this task. At the moment, just admin.
gulp.task('build:html', function () {
  return gulp.src('./admin/index.html')
    .pipe(gulp.dest('./build/admin/'))
})
