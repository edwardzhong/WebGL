var gulp = require('gulp');
var del = require('del');
var less = require('gulp-less');
var concatCss = require('gulp-concat-css');// 合并css
var cleanCSS = require('gulp-clean-css');// 压缩css
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var concatJS = require('gulp-concat'); //合并js
var uglify =require('gulp-uglify');//压缩js
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var rev = require('gulp-rev');// add md5 suffix to the file
var revCollector = require('gulp-rev-collector');  
var swig = require('gulp-swig');
var browserify = require('browserify');
var source = require("vinyl-source-stream");
var buffer = require('vinyl-buffer');
var babelify = require('babelify');
var sourcemaps  = require('gulp-sourcemaps');

//实时监控less转换为css
gulp.task('less', function () {
    return watch('./less/*.less', function (){//watch less file,conver to css when less content change
        gulp.src('./less/*.less')
        .pipe(less())
        .pipe(gulp.dest('./css'));
    });
});

//清除输出文件夹
gulp.task('clean', function(cb) {
    return del(['./dist','./rev'], cb);
});

//复制公共库目录下的所有内容
gulp.task('copy',function(){
    return gulp.src('./lib/**')
        .pipe(gulp.dest('./dist/lib/'));
});

//编译css，添加兼容后缀，压缩
gulp.task('css', function() {
    return gulp.src('./less/*.less')
        .pipe(less())
        // .pipe(concatCss("index.css"))
        .pipe(postcss([ autoprefixer({
                "browsers": ["last 2 version", "> 0.5%", "ie 6-8","Firefox < 20"]
                // "browsers": ["last 2 version", "> 0.1%"]
            })
        ]))
        .pipe(cleanCSS())
        // .pipe(rename({suffix: '.min'}))
        // .pipe(gulp.dest('./dist/css'));
        .pipe(rev())
        .pipe(gulp.dest('./dist/css'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'));

});

// gulp.task('js',function(){
//     return gulp.src('./js/*.js')
//         .pipe(concatJS('index.js'))
//         .pipe(uglify())
//         .pipe(rename({suffix: '.min'}))
//         // .pipe(gulp.dest('./dist/js'));

//         .pipe(rev())
//         .pipe(gulp.dest('./dist/js'))
//         .pipe(rev.manifest())
//         .pipe(gulp.dest('./rev/js'));
// });

//babel编译，压缩，产生版本信息
var scripts=['room','index','saturn'];
scripts.map(name=>{
    // gulp.task(name,function(){
    //     return gulp.src('./js/'+name+'.js')
    //         // .pipe(uglify())
    //         // .pipe(rename({suffix: '.bundle'}))// rename the file
    //         .pipe(sourcemaps.init({loadMaps: true})) //External sourcemap file
    //         .pipe(sourcemaps.write('./'))
    //         .pipe(rev())
    //         .pipe(gulp.dest('./dist/js/'))
    //         .pipe(rev.manifest(name+'.json'))
    //         .pipe(gulp.dest('./rev/js/'));
    // });

    gulp.task(name,function(){
            return  browserify({
                entries:'./js/'+name+'.js',  //entries file name
                debug:true // set true so the bundle file can generate sourcemap 
            })
            .transform(babelify,{  // same as the .babelrc
                plugins: ["transform-runtime"],
                presets: [
                    'es2015',  //convert to es5
                    'stage-0'  //es7
                ]
            })
            .bundle()  //merge
            .pipe(source(name+'.js'))
            .pipe(buffer())
            .pipe(uglify())
            // .pipe(rename({suffix: '.bundle'}))// rename the file
            .pipe(sourcemaps.init({loadMaps: true})) //External sourcemap file
            .pipe(sourcemaps.write('./'))
            .pipe(rev())
            .pipe(gulp.dest('./dist/js/'))
            .pipe(rev.manifest(name+'.json'))
            .pipe(gulp.dest('./rev/js/'));
    });
});

//swig编译输出html
gulp.task('html', function() {
  return gulp.src('./template/*.html')
    .pipe(swig({
        defaults: {cache: false }
    }))
    .pipe(gulp.dest('./'))
});

//更新css和js版本，同时替换html中的链接标签
gulp.task('rev', scripts.concat(["css","html"]),function () {
    return gulp.src(['./rev/**/*.json', './*.html'])//add md5 suffix to js and css file, replace the link of html as well 
        .pipe( revCollector({
            replaceReved: true,
            dirReplacements: {
                '/css': '/css',
                '/js': '/js'
            }
        }))
        .pipe( gulp.dest('./dist') );
});

gulp.task("default", ['copy','rev']);
