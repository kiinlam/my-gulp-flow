'use strict';

const path = require('path');
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const $ = gulpLoadPlugins();

const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const filesExist = require('files-exist');
const del = require('del');
const runSequence = require('gulp4-run-sequence');

const src = './src';
const dest = './dest';

const dir = {
  all: './src/**/*',
  js: './src/**/*.js',
  css: './src/**/*.css',
  image: './src/**/*.+(jpg|jpeg|png|gif)',
  jsbeautify: './jsbeautify/src/**/*.js',
  cssbeautify: './cssbeautify/src/**/*.css',
  jsbeautifyDest: './jsbeautify/dest',
  cssbeautifyDest: './cssbeautify/dest',
};

const allInOne = {
  name: 'allInOne.js',
  list: ['./src/**/a.js', './src/**/b.js', './src/**/c.js', './src/**/d.js'],
  src: ''
};


//---------------- default ----------------
gulp.task('default', cb => {
  runSequence([
    'clean:dest',
    'copy',
    'jsmin',
    'cssmin',
    'imagemin',
    cb]
  );
});

gulp.task('build', cb => {
  runSequence([
    'clean:allInOne',
    'clean:dest',
    'copy',
    'allInOne',
    'jsmin:custom',
    'cssmin',
    'imagemin',
    cb]
  );
});


//---------------- allInOne ----------------
let needConcat = false;

gulp.task('check:allInOne', () => {
  const condition = function (file) {
    if (needConcat) {
      return needConcat;
    }
    needConcat = file ? true : false;
    allInOne.src = path.join(src, path.dirname(file.relative));
    return needConcat;
  }

  return gulp.src(allInOne.list)
    .pipe($.if(condition, $.debug({title: 'allInOne files found:'})))
});

gulp.task('allInOne', gulp.series('check:allInOne', cb => {
  if (needConcat) {
    return gulp.src(filesExist(allInOne.list, {checkGlobs:true}))
      .pipe($.concat(allInOne.name), {newLine: ';'})
      .pipe(gulp.dest(allInOne.src))
      .pipe($.size({title: 'allInOne created:', showFiles: true}))
  } else {
    return del([ './src/**/allInOne.js' ]).then(paths => {
      console.log('\nDeleted src/**/allInOne.js:\n', paths.join('\n'), '\n');
    });
  }
}));

//---------------- js ----------------
gulp.task('jsmin', () => {
  return gulp.src(dir.js)
    .pipe($.debug({title: 'gulp-debug: js found', showFiles: false}))
    .pipe($.size({title: 'gulp-size: js'}))
    .pipe($.uglify())
    .pipe(gulp.dest(dest))
    .pipe($.debug({title: 'gulp-debug: js min', showFiles: false}))
    .pipe($.size({title: 'gulp-size: js min', showFiles: true}))
});

gulp.task('jsmin:custom', () => {
  return gulp.src([dir.js].concat(allInOne.list.map((i) => {
      return '!' + i
    })))
    .pipe($.debug({title: 'gulp-debug: js found', showFiles: false}))
    .pipe($.size({title: 'gulp-size: js'}))
    .pipe($.uglify())
    .pipe(gulp.dest(dest))
    .pipe($.debug({title: 'gulp-debug: js min', showFiles: false}))
    .pipe($.size({title: 'gulp-size: js min', showFiles: true}))
});

gulp.task('jsbeautify', () => {
  return gulp.src(dir.jsbeautify)
    .pipe($.debug({title: 'gulp-debug: js found'}))
    .pipe($.uglify({output:{beautify: true}}))
    .pipe(gulp.dest('./jsbeautify/dest'))
    .pipe($.debug({title: 'gulp-debug: js beautify output'}))
});


//---------------- css ----------------
gulp.task('cssmin', () => {
  return gulp.src(dir.css)
    .pipe($.debug({title: 'gulp-debug: css found', showFiles: false}))
    .pipe($.size({title: 'gulp-size: css'}))
    .pipe($.cssmin({showLog: true}))
    .pipe(gulp.dest(dest))
    .pipe($.debug({title: 'gulp-debug: css min output', showFiles: false}))
    .pipe($.size({title: 'gulp-size: css min'}))
});

gulp.task('cssbeautify', () => {
  return gulp.src(dir.cssbeautify)
    .pipe($.debug({title: 'gulp-debug: css found'}))
    .pipe($.cssbeautify())
    .pipe(gulp.dest('./cssbeautify/dest'))
    .pipe($.debug({title: 'gulp-debug: css beautify output'}))
});


//---------------- image ----------------
gulp.task('imagemin', () => {
  return gulp.src(dir.image)
    .pipe($.debug({title: 'gulp-debug: image found', showFiles: false}))
    .pipe($.imagemin([$.imagemin.gifsicle({colors: 128}), mozjpeg({quality: 80}), pngquant({quality: '65-80'}), $.imagemin.svgo()], {verbose: true}))
    .pipe(gulp.dest(dest))
    .pipe($.debug({title: 'gulp-debug: image min output', showFiles: false}))
});


//---------------- copy ----------------
gulp.task('copy', () => {
  return gulp.src([ dir.all, `!${dir.js}`, `!${dir.css}`, `!${dir.image}` ])
    .pipe($.debug({title: 'gulp-debug: file copied', showFiles: false}))
    .pipe(gulp.dest(dest))
});


//---------------- clean ----------------
gulp.task('clean', () => {
  return del([ `${src}/*`, dest ]).then(paths => {
    console.log('\nDeleted files and folders:\n', paths.join('\n'), '\n');
  });
});

gulp.task('clean:allInOne', () => {
  return del([ './src/**/allInOne.js' ]).then(paths => {
    console.log('\nDeleted files and folders:\n', paths.join('\n'), '\n');
  });
});

gulp.task('clean:dest', () => {
  return del([ dest ]).then(paths => {
    console.log('\nDeleted files and folders:\n', paths.join('\n'), '\n');
  });
});
