'use strict'

const gulp = require('gulp')
const del = require('del')

// Wipe out any existing files and folders in the ./public directory so we can
// start again fresh.
gulp.task('clean', function () {
  return del([
    `./build/**/*`,
    `!./build/.keep`
  ])
})
