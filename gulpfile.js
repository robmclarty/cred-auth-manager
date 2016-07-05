'use strict'

const gulp = require('gulp')
const argv = require('yargs').argv
const requireDir = require('require-dir')

// Require all tasks.
requireDir('./tasks', { recurse: true })

function setProductionEnv(done) {
  process.env.NODE_ENV = 'production'

  return done()
}

function watch() {
  // gulp.watch('styles/**/*', gulp.parallel('build:styles'))
  // gulp.watch('client/**/*', gulp.parallel('build:client', 'build:html'))
  // gulp.watch('assets/**/*', gulp.parallel('build:assets'))
  gulp.watch('server/**/*', gulp.series('server'))
}
watch.description = 'Watch variable folders for changes and rebuild if necessary.'
gulp.task(watch)

// Build for production (include minification, revs, etc.).
// const buildProduction = gulp.series(
//   'clean',
//   setProductionEnv,
//   gulp.parallel(
//     'build:vendors',
//     'build:admin',
//     'build:styles',
//     'build:styles:templates',
//     'build:assets',
//     'build:html'
//   ),
//   'rev:assets',
//   gulp.parallel('rev:js', 'rev:css'),
//   'rev:html'
// )

// Build for development (include React dev, no revs, no minification, etc.).
// const buildDevelopment = gulp.series(
//   'clean',
//   gulp.parallel(
//     'build:vendors',
//     'build:admin',
//     'build:styles',
//     'build:styles:templates',
//     'build:assets',
//     'build:html'
//   )
// )

// // Choose between building for dev or production based on --production flag.
// function build(done) {
//   if (argv.production) {
//     buildProduction()
//   } else {
//     buildDevelopment()
//   }
//
//   return done()
// }
// build.description = 'Build all the things!'
// build.flags = {
//   '--production': 'Builds in production mode (minification, revs, etc.).'
// };
// gulp.task(build)
//
// // Deploy to server.
// function deploy(done) {
//   if (argv.host) process.env.SERVER_HOST = argv.host
//
//   gulp.series(
//     buildProduction,
//     'deploy:assets',
//     'deploy:server',
//     'deploy:reload'
//   )()
//
//   return done()
// }
// deploy.description = 'Build for production and deploy to server, restarting the server when finished.'
// deploy.flags = {
//   '--host': 'Sets the host to where the server you want to deploy to is located.'
// };
// gulp.task(deploy)

gulp.task('default', gulp.series('server', watch))
