var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserify = require('gulp-browserify'),
  concat = require('gulp-concat'),
  refresh = require('gulp-livereload'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  pixrem = require('gulp-pixrem'),
  minifyHTML = require('gulp-minify-html'),
  webserver = require('gulp-connect');

var mode = require('gulp-mode')({
  modes: ["production", "development"],
  default: "development",
  verbose: false
});

//Task for sass using libsass through gulp-sass
gulp.task('sass', function(){
  gulp.src('src/sass/app.scss')
    .pipe(mode.development(plumber({errorHandler: errorAlert})))
    .pipe(sass({
      includePaths: ['src/sass'],
      outputStyle: 'compressed'
    }))
    .pipe(pixrem())
    .pipe(gulp.dest('public'))
    .pipe(webserver.reload())
});

//Task for processing js with browserify
gulp.task('browserify', function(){
  gulp.src('src/js/*.js')
    .pipe(browserify())
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public'))
    .pipe(mode.development(webserver.reload()))
});

gulp.task('copy-assets', function(){
  gulp.src('src/assets/**')
    .pipe(gulp.dest('public'))
    .pipe(mode.development(webserver.reload()))
});

gulp.task('views', function(){
  var opts = {
    conditionals: true,
    spare:true,
    comments:true
  };

  gulp.src('src/views/**')
    .pipe(mode.production(minifyHTML(opts)))
    .pipe(gulp.dest('public'))
    .pipe(mode.development(webserver.reload()))
});

//Convenience task for running a one-off build
gulp.task('build', ['sass', 'copy-assets', 'views']);

gulp.task('serve', function() {
  webserver.server({
    root: 'public',
    livereload: true,
  });
});

gulp.task('watch', function() {

  //Add watching on sass-files
  gulp.watch('src/sass/*.scss',['sass']);
  gulp.watch('src/sass/**/*.scss',['sass']);
  gulp.watch('src/assets/**',['copy-assets']);
  gulp.watch('src/views/**',['views']);


  //Add watching on js-files
  //gulp.watch('assets/js/*.js', ['browserify']);

});

gulp.task('default', ['build', 'serve', 'watch']);

function errorAlert(error){
  notify.onError({title: "SCSS Error", message: "Check your terminal", sound: "Sosumi"})(error); //Error Notification
  console.log(error.toString());//Prints Error to Console
  this.emit("end"); //End function
}