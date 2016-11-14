'use strict'

const gulp = require('gulp')
const rsync = require('gulp-rsync')
const argv = require('yargs').argv
const spawn = require('child_process').spawn

const serverConf = require('../config/server')
const host = process.env.SERVER_HOST || 'telus-health-book'
const appRoot = `/opt/${ serverConf.folderName }`
const staticRoot = `/srv/opt/${ serverConf.folderName }`
const pm2Conf = `/etc/opt/${ serverConf.folderName }/pm2.json`
const spawnConf = { cwd: appRoot, env: process.env }

const manifestAssets = 'rev-assets-manifest.json'
const manifestScripts = 'rev-scripts-manifest.json'
const manifestStyles = 'rev-styles-manifest.json'

const bufferToString = (data) => {
  const buff = new Buffer(data)
  return buff.toString('utf8')
}

const concatCommands = (acc, cmd) => {
  return acc ? `${ acc } && ${ cmd }` : cmd
}

// Copy static assets to server.
// `hostname` is actually the SSH symbol used in ~/.ssh/config
gulp.task('deploy:assets', function () {
  const serverHost = argv.host || process.env.SERVER_HOST || host
  const rsyncConf = {
    root: 'build',
    hostname: serverHost,
    destination: staticRoot,
    progress: true,
    recursive: true,
    clean: true,
    exclude: [
      '*.map',
      manifestAssets,
      manifestScripts,
      manifestStyles
    ]
  }

  return gulp.src('./build/**')
    .pipe(rsync(rsyncConf))
})

// Copy all files in /server as well as npm package manifest.
gulp.task('deploy:server', function () {
  const serverHost = argv.host || process.env.SERVER_HOST || host
  const rsyncConf = {
    hostname: serverHost,
    destination: appRoot,
    progress: true,
    recursive: true,
    clean: true
  }

  return gulp.src([
      './server/**',
      './.sequelizerc',
      './config/server.js',
      './config/database.js',
      './db/**',
      'package.json'
    ])
    .pipe(rsync(rsyncConf))
})

// Install npm dependencies and restart pm2 process on remote server over SSH.
//
// References:
// ssh remote commands in quotes using spawn - http://stackoverflow.com/questions/27670686/ssh-with-nodejs-child-process-command-not-found-on-server
// npm flags - https://docs.npmjs.com/misc/config
// child_process docs - https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
// stdio options - https://nodejs.org/api/child_process.html#child_process_options_stdio
gulp.task('deploy:reload', function (done) {
  const serverHost = argv.host || process.env.SERVER_HOST || host
  const remoteCommandList = [
    `cd ${ appRoot }`,
    'npm install --production --loglevel info',
    `sudo pm2 reload ${ pm2Conf }`
  ]
  const remoteCommands = remoteCommandList.reduce(concatCommands, '')
  const proc = spawn('ssh', [serverHost, remoteCommands], { stdio: 'inherit' })

  proc.on('exit', function (code) {
    if (code !== 0) {
      console.log(`restart process exited with code ${ code }`)
      return
    }

    console.log('@@@@ server reloaded successfully :)')
  })

  done()
})
