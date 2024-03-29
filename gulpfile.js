'use strict';

var gulp = require('gulp'),
  gls = require('gulp-live-server'),
  rimraf = require('gulp-rimraf'),
  rename = require('gulp-rename'),
  glob = require('glob-all'),
  path = require('path'),
  fs = require('fs-extra'),
  flatten = require('gulp-flatten'),
  gutil = require('gulp-util'),
  hogan = require('gulp-hogan'),
  sass = require('gulp-sass');

gulp.task('clean', function() {
  return gulp.src(
    glob.sync([
      __dirname + '/**/public',
      __dirname + '/views'
    ]), { read : false})
    .pipe(rimraf({ force : true }))
});

gulp.task('move', function () {
  return gulp.src('node_modules/govuk_*/**/*.@(js|css|png|gif|jpg|jpeg)')
    .pipe(rename(function (path) {
      path.dirname = path.dirname.replace(/^.*?[\\\/](assets)?/, '');
    }))
    .pipe(gulp.dest('public'))
});

// This is stupid
gulp.task('template', function () {
  return gulp.src('node_modules/govuk_*/**/layouts/govuk_template.html')
    .pipe(flatten())
    .pipe(hogan({
      assetPath: "{{assetPath}}",
      afterHeader: "{{$afterHeader}}{{/afterHeader}}",
      bodyClasses: "{{$bodyClasses}}{{/bodyClasses}}",
      bodyEnd: "{{$bodyEnd}}{{/bodyEnd}}",
      content: "{{$content}}{{/content}}",
      cookieMessage: "{{$cookieMessage}}{{/cookieMessage}}",
      crownCopyrightMessage: "{{$crownCopyrightMessage}}© Crown copyright{{/crownCopyrightMessage}}",
      footerSupportLinks: "{{$footerSupportLinks}}{{/footerSupportLinks}}",
      footerTop: "{{$footerTop}}{{/footerTop}}",
      globalHeaderText: "{{$globalHeaderText}}GOV.UK{{/globalHeaderText}}",
      head: "{{$head}}{{/head}}",
      headerClass: "{{$headerClass}}{{/headerClass}}",
      homepageUrl: "{{$homepageUrl}}https://www.gov.uk{{/homepageUrl}}",
      insideHeader: "{{$insideHeader}}{{/insideHeader}}",
      licenceMessage: "{{$licenceMessage}}<p>All content is available under the <a href='https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/' rel='license'>Open Government Licence v3.0</a>, except where otherwise stated</p>{{/licenceMessage}}",
      logoLinkTitle: "{{$logoLinkTitle}}Go to the GOV.UK homepage{{/logoLinkTitle}}",
      pageTitle: "{{$pageTitle}}GOV.UK - The best place to find government services and information{{/pageTitle}}",
      propositionHeader: "{{$propositionHeader}}{{/propositionHeader}}",
      skipLinkMessage: "{{$skipLinkMessage}}Skip to main content{{/skipLinkMessage}}"
    }))
    .pipe(rename('govuk_template.html'))
    .pipe(gulp.dest(path.join(__dirname, 'views')));
});

// This needs tidying up, preferrably with Q
// TODO: Fix this so it returns an async thing and
// doesn't break dependant tasks
gulp.task('sass', function () {

  var appDir = 'app';

  fs.readdir(appDir, function (err, files) {
    if (err) throw err;
    files.forEach(function (file) {
      fs.stat(path.join(__dirname, appDir, file), function (err, stats) {
        if (err) throw err;
        if (stats.isDirectory()) {
          gulp.src(path.join(__dirname, appDir, file, 'src/sass/**/*.scss'))
            .pipe(sass({
              outputStyle : 'extended',
              includePaths : glob.sync(path.join(__dirname, 'node_modules/govuk_*/stylesheets'))
            }))
            .pipe(gulp.dest(
              path.join(__dirname, appDir, file, 'public/assets/stylesheets')))
        }
      });
    });
  });
});

gulp.task('build', ['sass', 'move']);

// TODO: add 'build' as dependent task when it works
gulp.task('start', function () {
  var server = gls.new('start.js', 3000);
  server.start();

  // recompiles sass files on the fly
  gulp.watch(glob.sync('app/**/*.scss'), ['sass']);

  // restarts the server when the start file changes
  // TODO: add routes files to this
  gulp.watch('start.js', server.start.bind(server));
});

gulp.task('default', ['start']);