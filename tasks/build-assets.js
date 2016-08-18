'use strict'

const gulp = require('gulp')
const merge = require('merge-stream')

gulp.task('build:assets', function () {
  return gulp.src('assets/**/*')
    .pipe(gulp.dest('./build'))
})

gulp.task('build:html', function () {
  const homepage = gulp.src('./assets/index.html')
    .pipe(gulp.dest('./build'))
  const admin = gulp.src('./admin/index.html')
    .pipe(gulp.dest('./build/admin'))

  return merge(homepage, admin)
})
