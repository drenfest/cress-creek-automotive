const gulp = require('gulp'); //is the glue to all the tools on this document
const browserSync = require('browser-sync').create(); //gives us a live reloading browser
const imagemin = require('gulp-imagemin'); //minifies our png and jpg images
const sass = require('gulp-sass'); //gives us easy seperation of our styles
const autoprefixer = require('autoprefixer'); //applies prefixes to most major browsers onto our css
const postcss = require('gulp-postcss'); // is the base for unprefix
const unprefix = require('postcss-unprefix'); //removes browser prefixes from css so it's clean and we can apply the most up to date prefixes
const purifycss = require('gulp-purifycss'); //removes unused css
const image = require('gulp-image')//optimize images imagemin can't;

//Todo transform image tags in html to picture tags for 4 screen sizes and have a retina display version for 4 screen sizes so 8 files
//Todo create cropped copies of the images for different screen sizes
//Todo create a desktop application or ide plugin to select the area to crop for smaller devices


//Todo make a template system that replaces parses shortcodes in our src/html files and replaces it with an html template file's contents from src/templates/{$filename_Dir}/index.html
//Todo bundle src/templates/{templatename_dir}/*{.js,.css} to public/{css,js}/{templatename}.bundle.{js,css} so the code templates can be reused on other projects
        //good examples for this would be a header, footer, main navigation, footer navigation, sidenav, carousel, gallery, call-to-action, contact-form, custom-menu, hero banner, testimonial-section, coupon section

//Todo build schema into html injector

//Todo inject social metadata

//Todo build a crawler to go through each html page and test it for best practices

//Todo add framework so that email can be sent through login verified smtp









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
    src: 'src/img/*.{jpg,JPG,png,PNG,gif,GIF,jpeg,JPEG,svg,SVG}',
    dest: 'public/img/'
  },
  html: {
    src: 'src/*.html',
    dest: 'public/'
  }
};

//Compile sass into CSS & auto inject into browsers
function styles(){ //combine and prefix css files
  let processors = [
    unprefix(),
    autoprefixer({
      browsers: ['last 4 versions'],
      cascade: false
    })
  ];
  return gulp.src(paths.styles.src)
    .pipe(sass()) //compiles our sass into css files
    .pipe(postcss(processors))
    .pipe(purifycss(['/public/**/*.html'])) //scans the public directory's html files then removes unused styles from css
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

//Move Html To Public Dir
function html(){
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream());
}
//Move bootstraps and all custom javascript files into our /public/js folder
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
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      mozjpeg: true,
      guetzli: false,
      gifsicle: true,
      svgo: true,
      concurrent: 10,
      quiet: true // defaults to false
    }))
    .pipe(gulp.dest(paths.images.dest));
};
function watch(){
  //watch for changes in all sass files
  gulp.watch(paths.styles.src,styles()); //watch for style changes
  gulp.watch(paths.html.src,html()); //watches public folder and eventually will minimize the html files
  //watch for changes on all html files and reload the browser when they change
  gulp.watch("src/*.html").on('change',browserSync.reload);
}

function loadServer(){ //setup the browser-sync server
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