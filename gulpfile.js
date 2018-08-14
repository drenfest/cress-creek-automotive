const gulp = require('gulp'); //is the glue to all the tools on this document
const browserSync = require('browser-sync').create(); //gives us a live reloading browser
const imagemin = require('gulp-imagemin'); //minifies our png and jpg images
const sass = require('gulp-sass'); //gives us easy seperation of our styles
const autoprefixer = require('autoprefixer'); //applies prefixes to most major browsers onto our css
const postcss = require('gulp-postcss'); // is the base for unprefix
const unprefix = require('postcss-unprefix'); //removes browser prefixes from css so it's clean and we can apply the most up to date prefixes
const purifycss = require('gulp-purifycss'); //removes unused css
const image = require('gulp-image')//optimize images imagemin can't;
const resizer = require('gulp-images-resizer');
const fs = require('fs');
const path = require('path');
const replace = require('gulp-replace');
const rs = require('replacestream');
const through = require('through2');
const stream = require('stream');
const Transform = require('stream').Transform;
const util = require('util');


















//Todo inject srcset attributes into <img /> tags image tags for 4 screen sizes and have a retina display version for 4 screen sizes

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
    src: 'src/img/*',
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
// Create html templates from /src/data/pages.json file\
function createTemplates(){
  //parse /src/templates/page.html
  //store page.html content into a variable
  var pageContent = fs.readFileSync("src/templates/page.html");
  //parse pages.json file
  var getFileJson = require("./src/data/pages.json");//load the json file
  var obj = JSON.parse(JSON.stringify(getFileJson)); //parse the json file
obj.forEach(function() {
  for (var i in obj){
    //store link into link variable
    var link = obj[i].link;
    //store title into title variable
    var title = obj[i].title;
    //store desc into description variable
    var desc = obj[i].desc;

    //write all html templates where the
      //filename is the link from the link variable
    fs.writeFile('src/'+link,pageContent,function(){
      console.log(link + ' was written\n');
    });
  }
});
}

function fillTempTags() {
  /*
**GET ALL FILES
 */
  var templates = {

  }
  htmlFiles =[];
  sitePages = [];
  templateStrings = [];
  var files1 = fs.readdirSync('src/templates');
  for (files1I in files1){
    var name = files1[files1I];
    tempFileContents = fs.readFileSync('src/templates/'+name).toString();
    tempStrings = tempFileContents.match(/{{(.*)}}/g);
    for(var i in tempStrings){
      tempString = tempStrings[i].replace(/{{(.*)}}/,"$1").toLowerCase();
      if(fs.existsSync('src/templates/'+tempString+'.html')){
        tempFileContents = tempFileContents.replace(tempStrings[i],fs.readFileSync('src/templates/'+tempString+'.html'));
        addToTemplates = {"content": tempFileContents,"location":"src/templates/"+tempString+'.html'};
        templates[tempString]=addToTemplates;
      }
    }
    if(name.substring((name.length - 4),(name.length)) == 'html'){
      htmlFiles.push('src/templates/'+name);
      // var tempToReplace=;
      // var replaceTempWith=;
    }
  }
  fs.writeFileSync('src/data/temptags.json',JSON.stringify(templates),{flag: 'w+'});
  console.log('wrote template files');

}
//Move Html To Public Dir
function html(){
  createTemplates();
  fillTempTags();
  var getFileJson = require("./src/data/temptags.json");//load the json file
  var obj = JSON.parse(JSON.stringify(getFileJson)); //parse the json file
  return gulp.src(paths.html.src)
    .pipe(replace(/{{(.*)}}/g,`{{$1}}`.toLowerCase()))
    .pipe(
      replace(/{{(.*)}}/g,function(match){
            matchKey = match.replace(/{{(.*)}}/,"$1").toLowerCase();
            tempContent = obj[matchKey];
            console.log(matchKey+':---->'+tempContent.content);
            return tempContent.content;

      }
      )
    )


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
//images successfully crop at these widths Todo need to format html to call the images responsively and need to pull new image height into name
function cropImages(){
  let imageSizes = [540,768,900,1140,2000];
  imageSizes.forEach(function(element){
    return gulp.src(paths.images.src)
      .pipe(resizer({
        width: element
      }))
      .pipe(gulp.dest(paths.images.dest+element+'/'))
  })
}
function watch(){
  //watch for changes in all sass files
  gulp.watch(paths.styles.src,styles()); //watch for style changes
  gulp.watch(paths.html.src,html()); //watches public folder and eventually will minimize the html files
  //watch for changes on all html files and reload the browser when they change
  gulp.watch("src/*.html").on('change',gulp.series(html));
  gulp.watch("public/*.html").on('change',browserSync.reload);
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
exports.cropImages = cropImages;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watch = watch;
exports.loadServer = loadServer;
exports.createTemplates = createTemplates;
exports.fillTempTags = fillTempTags;

let runServer = gulp.series(gulp.parallel(html,styles,scripts,cropImages,images,watch,loadServer));
//Static Server + File Watcher-> scss/html files
gulp.task('runServer',runServer);


gulp.task('default', runServer);