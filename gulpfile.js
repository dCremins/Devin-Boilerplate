// Gulp is an automation tool
var gulp = require('gulp')
// Browsersync gives a live preview of your code
// useful for development
var browserSync = require('browser-sync');
// load all plugins in 'devDependencies' into the variable $
// Takes less lines than declaring each and auto-adds new packages
const $ = require('gulp-load-plugins')({
        pattern: ['*'],
        scope: ['devDependencies']
    });
// package vars
// lets you set file paths from package.json to cut down
// on the number of files you need to edit for each new site
const pkg = require('./package.json');


/* Development*/

// Take all the scss files declared in package.json and convert them
// to css with sourcemaps in the desired folder
gulp.task('styles', () => {
    $.fancyLog("-> Compiling scss: " + pkg.paths.development.scss + pkg.vars.scssName);
    return gulp.src(pkg.paths.development.scss + pkg.vars.scssName)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
                includePaths: pkg.paths.scss
            })
            .on('error', $.sass.logError))
        .pipe($.cached('sass_compile'))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write(pkg.paths.development.sourcemaps))
        .pipe(gulp.dest(pkg.paths.development.css));
});



/* Production */

gulp.task('bundle-js', () => {
  return gulp.src(pkg.paths.development.js + '*.js')
    .pipe($.concat('bundle.js'))
    .pipe($.minify({
        	ext:{
        		min:'.js'
        	},
        	noSource: true
      }))
    .pipe(gulp.dest(pkg.paths.html.js));
});

gulp.task('bundle-css', ['styles'], () => {
  return gulp.src(pkg.paths.development.css + '*.css')
    .pipe($.sourcemaps.init())
    .pipe($.cssimport())
    .pipe($.cleanCss({
            compatibility: "ie8",
            keepSpecialComments : 0,
            target: pkg.paths.html.css,
            relativeTo: ""
        }))
    .pipe($.concat('style.css', {newLine: ""}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(pkg.paths.html.css));
});

gulp.task('bundle-html', function () {
    return gulp.src(pkg.paths.development.base + 'pages/html/*.html')
        .pipe($.htmlImport(pkg.paths.development.base + 'templates/html/'))
        .pipe(gulp.dest(pkg.paths.html.base));
})

gulp.task('bundle-php', function () {
    return gulp.src(pkg.paths.development.base + 'pages/php/*.php')
        .pipe($.htmlImport(pkg.paths.development.base + 'templates/php/'))
        .pipe(gulp.dest(pkg.paths.php.base));
})

gulp.task('bundle-assets', () => {
  return gulp.src(pkg.paths.development.fonts + '**/*').pipe(gulp.dest(pkg.paths.html.fonts));
  return gulp.src(pkg.paths.development.img + '**/*').pipe(gulp.dest(pkg.paths.html.img));
});

gulp.task('publish-html', ['bundle-css', 'bundle-js', 'bundle-html', 'bundle-assets'], function () {
  var css = gulp.src(pkg.paths.html.css + '*.css');
  var js = gulp.src(pkg.paths.html.js + '*.js');
  return gulp.src(pkg.paths.html.base +'*.html')
    .pipe($.inject( css, { relative:true, selfClosingTag: true  }))
    .pipe($.inject( js, { relative:true, selfClosingTag: true } ))
    .pipe(gulp.dest(pkg.paths.html.base));
});


// Prepare Browser-sync for localhost
gulp.task('browser-sync', function() {
    browserSync.init(['css//.css', 'js//.js'], {
        server: {
            baseDir: pkg.paths.html.base
        }
    });
});

// Reload task
gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Watch scss, js and html files, doing different things with each.
gulp.task('watch', ['inject-html', 'browser-sync'], function () {
    gulp.watch([
      pkg.paths.development.base + '**/*'
    ], ['inject-html', 'bs-reload']);
});
/* Default */

gulp.task('default', ['bundle-css', 'bundle-js']);
