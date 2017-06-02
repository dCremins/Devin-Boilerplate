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

// Take all the scss files declared in package.json and convert them
// to css with sourcemaps in the desired folder
gulp.task('styles', () => {
    $.fancyLog("-> Compiling scss: " + pkg.paths.dist.scss + pkg.vars.scssName);
    return gulp.src(pkg.paths.dist.scss + pkg.vars.scssName)
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
                includePaths: pkg.paths.scss
            })
            .on('error', $.sass.logError))
        .pipe($.cached('sass_compile'))
        .pipe($.autoprefixer())
        .pipe($.sourcemaps.write(pkg.paths.dist.sourcemaps))
        .pipe(gulp.dest(pkg.paths.dist.css))
// Reload the browser CSS after every change
        .pipe(browserSync.reload({stream:true}));
});

// Prepare Browser-sync for localhost
gulp.task('browser-sync', function() {
    browserSync.init(['css//.css', 'js//.js'], {
        server: {
            baseDir: pkg.paths.dist.base
        }
    });
});

// Reload task
gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Watch scss, js and html files, doing different things with each.
gulp.task('watch', ['styles', 'browser-sync'], function () {
// Watch scss, run the styles task on change.
    gulp.watch([pkg.paths.dist.scss + '*.scss', pkg.paths.dist.scss + '**/*.scss'], ['styles'])
// Watch app.js file, run the scripts task on change.
    //gulp.watch([pkg.paths.dist.js + '*.js', pkg.paths.dist.js + '*/.js'], ['scripts'])
// Watch .html and .php files, run the bs-reload task on change.
    gulp.watch([pkg.paths.dist.base + '*.html', pkg.paths.dist.base + '*.php'], ['bs-reload']);
});

gulp.task('default', ['styles']);
