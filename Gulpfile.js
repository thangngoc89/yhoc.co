var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserify = require('gulp-browserify'),
  concat = require('gulp-concat'),
  refresh = require('gulp-livereload'),
  lrserver = require('tiny-lr')(),
  express = require('express'),
  livereload = require('connect-livereload'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  pixrem = require('gulp-pixrem'),
  //mode = require('gulp-mode')(),
  livereloadport = 35729,
  serverport = 5000;

//We only configure the server here and start it only when running the watch task
var server = express();
//Add livereload middleware before static-middleware
server.use(livereload({
  port: livereloadport
}));

server.use(express.static('./public'));

//Task for sass using libsass through gulp-sass
gulp.task('sass', function(){
  gulp.src('assets/scss/app.scss')
    .pipe(plumber({errorHandler: errorAlert}))
    .pipe(sass({
      includePaths: ['assets/scss'],
      outputStyle: 'compressed'
    }))
    .pipe(pixrem())
    .pipe(gulp.dest('public'))
    .pipe(refresh(lrserver));
});

//Task for processing js with browserify
gulp.task('browserify', function(){
  gulp.src('assets/js/*.js')
    .pipe(browserify())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public'))
    .pipe(refresh(lrserver));
});

//Convenience task for running a one-off build
gulp.task('build', ['sass']);

gulp.task('serve', function() {
  //Set up your static fileserver, which serves files in the build dir
  server.listen(serverport, '0.0.0.0');

  //Set up your livereload server
  lrserver.listen(livereloadport);
});

gulp.task('watch', function() {

  //Add watching on sass-files
  gulp.watch('assets/scss/*.scss',['sass']);

  //Add watching on js-files
  //gulp.watch('assets/js/*.js', ['browserify']);

});

gulp.task('default', ['build', 'serve', 'watch']);

function errorAlert(error){
  notify.onError({title: "SCSS Error", message: "Check your terminal", sound: "Sosumi"})(error); //Error Notification
  console.log(error.toString());//Prints Error to Console
  this.emit("end"); //End function
};