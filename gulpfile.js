const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const unprefix = require('postcss-unprefix');
const purifycss = require('gulp-purifycss');

//Define Paths
const paths = {
  styles: {
    src: [
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'src/scss/*.scss'
    ],
    dest: 'public/css/'
  },
  scripts: {
    src: [
      'node_modules/bootstrap/dist/js/bootstrap.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/popper.js/dist/umd/popper.min.js'
    ],
    dest: 'public/js/'
  },
  images: {
    src: 'src/img/*.{jpg,png}',
    dest: 'public/img/'
  },
  html: {
    src: 'src/*.html',
    dest: 'public/'
  }
};

//Compile sass into CSS & auto inject into browsers
function styles(){
  let processors = [
    unprefix(),
    autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false
    })
  ];
  return gulp.src(paths.styles.src)
    .pipe(sass())
    .pipe(postcss(processors))
    .pipe(purifycss(['/public/**/*.html']))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

//Move Html To Public Dir (eventually minify html files)
function html(){
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}
//Move the javascript files into our /src/js folder
function scripts(){
  return gulp.src(paths.scripts.src)
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream());
}
//optimize images
// Copy all static images
function images() {
  return gulp.src(paths.images.src)
  // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.images.dest));
};
function watch(){
  //watch for changes in all sass files
  gulp.watch(paths.styles.src,styles());
  gulp.watch(paths.html.src,html());
  //watch for changes on all html files and reload the browser when they change
  gulp.watch("src/*.html").on('change',browserSync.reload);
}

function loadServer(){
  browserSync.init({
    //select the directory to serve files from
    server: {
      baseDir: "./public"
    }
  });
}


/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watch = watch;

let runServer = gulp.series(gulp.parallel(html,styles,scripts,images,watch));
//Static Server + File Watcher-> scss/html files
gulp.task('runServer',runServer);


gulp.task('default', runServer);