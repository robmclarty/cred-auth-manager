// 'use strict'
//
// const gulp = require('gulp')
// const minifycss = require('gulp-cssnano')
// const concat = require('gulp-concat')
// const sass = require('gulp-sass')
// const gulpif = require('gulp-if')
// const sourcemaps = require('gulp-sourcemaps')
// const autoprefixer = require('gulp-autoprefixer')
//
// const autoprefixerBrowsers = [
//   'last 3 versions',
//   'ie >= 9',
//   'ios >= 7',
//   'android >= 4.4',
//   'bb >= 10'
// ]
//
// // Compile all SASS into CSS along with auto-prefixing and rev-replace static
// // assets. Minify and output to the public folder.
// gulp.task('build:styles', function () {
//   const isProduction = process.env.NODE_ENV === 'production'
//
//   return gulp.src('./styles/main.scss')
//     .pipe(gulpif(!isProduction, sourcemaps.init()))
//       .pipe(concat('application.scss'))
//       .pipe(sass({ style: 'expanded' }))
//       .pipe(autoprefixer(autoprefixerBrowsers))
//       .pipe(gulpif(isProduction, minifycss()))
//     .pipe(gulpif(!isProduction, sourcemaps.write()))
//     .pipe(gulp.dest('./public/stylesheets'))
// });
//
// const compileEmailSass = name => () => {
//   return gulp.src(`./server/email_templates/sass/${ name }.scss`)
//     .pipe(concat('style.scss'))
//     .pipe(sass({ style: 'expanded' }))
//     .pipe(autoprefixer(autoprefixerBrowsers))
//     .pipe(minifycss())
//     .pipe(gulp.dest(`./server/email_templates/${ name }/`))
// };
//
// gulp.task('build:styles:templates', gulp.parallel(
//   compileEmailSass('feedback'),
//   compileEmailSass('invitation'),
//   compileEmailSass('password_reset')
// ))
