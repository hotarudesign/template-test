const gulp = require("gulp");
const del = require("del");
const browserSync = require("browser-sync");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const sass = require("gulp-sass");
sass.compiler = require("sass");
const autoprefixer = require("gulp-autoprefixer");
const imagemin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");
const mozjpeg = require("imagemin-mozjpeg");
const htmlbeautify = require("gulp-html-beautify");
const php = require("gulp-connect-php");

// distフォルダを削除するタスク
gulp.task("clean", function () {
  return del("dist");
});

// ローカルサーバの立ち上げタスク
gulp.task("browser", function (done) {
  php.server(
    {
      port: 3000,
      livereload: true,
      base: "./src/",
    },
    function () {
      browserSync({
        proxy: "localhost:3000",
      });
    }
  );

  gulp.watch("src/**", function (done) {
    browserSync.reload();
    done();
  });
});

// Sassのコンパイルタスク
gulp.task("sass", function () {
  return gulp
    .src("src/**/*.scss", { base: "./scss" })
    .pipe(
      sass({
        outputStyle: "expanded",
      })
    )
    .pipe(autoprefixer())
    .pipe(gulp.dest("./css"));
});

//　画像圧縮タスク
gulp.task("imagemin", function () {
  return gulp
    .src("src/**/*.{jpg,jpeg,png,gif,svg}")
    .pipe(
      imagemin([
        pngquant({
          quality: [0.65, 0.8],
          speed: 1,
          floyd: 0,
        }),
        mozjpeg({
          quality: 85,
          progressive: true,
        }),
        imagemin.svgo(),
        imagemin.optipng(),
        imagemin.gifsicle({ optimizationLevel: 3 }),
      ])
    )
    .pipe(gulp.dest("dist/img/_min"));
});

// コピータスク
gulp.task("copy", function () {
  return gulp.src(["src/**/*", "!**/*.scss"]).pipe(gulp.dest("dist"));
});

// 削除タスク
gulp.task("clean-dist", function (done) {
  del(["dist/**/*.scss", "dist/**/*.css.map"]);
  done();
});

// watchタスク
gulp.task("watch", function () {
  gulp.watch("src/**/*.scss", gulp.task("sass"));
});

// 納品フォルダ作成タスク
gulp.task(
  "ftp",
  gulp.series("clean", "sass", "copy", "imagemin", "clean-dist")
);

// デフォルトタスク
gulp.task("default", gulp.series(gulp.parallel("browser", "sass", "watch")));
