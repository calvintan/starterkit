var gulp = require('gulp')
var sass = require('gulp-sass')
var plumber = require('gulp-plumber')
var notify = require('gulp-notify')
var browserSync = require('browser-sync').create()
var autoprefixer = require('gulp-autoprefixer')
var sourcemaps = require('gulp-sourcemaps')
var useref = require('gulp-useref')
var uglify = require('gulp-uglify')
var gulpIf = require('gulp-if')
var cssnano = require('gulp-cssnano')
var imagemin = require('gulp-imagemin')
var cache = require('gulp-cache')
var del = require('del')
var runSequence = require('run-sequence')

gulp.task('browserSync', function () {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  })
})

gulp.task('sass', function () {
  return gulp.src('app/scss/**/*.scss')
    .pipe(customPlumber('Error running Sass'))
    .pipe(sourcemaps.init()) // init sourcemaps
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['ie 8-9', 'last 2 versions']
    }))
    .pipe(sourcemaps.write()) // write sourcemaps
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
})

gulp.task('watch', function () {
  gulp.watch('app/*.html', browserSync.reload)
  gulp.watch('app/scss/**/*.scss', ['sass'])
  gulp.watch('app/js/**/*.html', browserSync.reload)
})

gulp.task('useref', function () {
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
})

gulp.task('images', function () {
  return gulp.src('app/images/**/*.+(png|jpg|gif|svg)')
    .pipe(cache(imagemin({
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
})

gulp.task('fonts', function () {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
})

function customPlumber (errTitle) {
  return plumber({
    errorHandler: notify.onError({
      title: errTitle || 'Error running Gulp',
      message: 'Error: <%= error.message %>'
    })
  })
}

gulp.task('clean', function () {
  return del.sync('dist').then(function (cb) {
    return cache.clearAll(cb)
  })
})

gulp.task('clean:dist', function () {
  return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*'])
})

gulp.task('build', function (callback) {
  runSequence(
    'clean:dist',
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
})

gulp.task('default', function (callback) {
  runSequence(['sass', 'browserSync', 'watch'],
    callback
  )
})
