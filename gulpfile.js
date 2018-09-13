let path        = require("path");
let del         = require("del");
let merge       = require('merge2');
let gulp        = require("gulp");
let tslint      = require("gulp-tslint");
let typescript  = require("gulp-typescript");

let configPath = "tsconfig.json";
let srcDir = "src";
let srcFiles = srcDir + "/**/*.ts";
let nodeDir = "dist";
let typesDir = "types";
let watching = false;

function handleError() {
    if (watching) this.emit("end");
    else process.exit(1);
}

// Set watching
gulp.task("setWatch", (done) => {
    watching = true;
    return done();
});

gulp.task("doWatch", () => {
    return gulp.watch(srcFiles, ["default"]);
});

// Clear built directories
gulp.task("clean", (done) => {
    if (!watching) del([nodeDir, typesDir]);
    return done();
});

// Lint the source
gulp.task("lint", () => {
    return gulp.src(srcFiles)
    .pipe(tslint({
        formatter: "stylish"
    }))
    .pipe(tslint.report({
        emitError: !watching
    }))
});

gulp.task("compile", () => {
    return merge([
        gulp.src(srcFiles)
        .pipe(typescript.createProject(configPath)())
        .on("error", handleError).js
        .pipe(gulp.dest(nodeDir)),
        gulp.src(srcFiles)
        .pipe(typescript.createProject(configPath)())
        .on("error", handleError).dts
        .pipe(gulp.dest(typesDir))
    ]);
});

// Build TypeScript source into CommonJS Node modules
gulp.task("cleanThenCompile", gulp.series("clean", "compile"));

gulp.task("default", gulp.series("lint", "cleanThenCompile"));

gulp.task("watch", gulp.series("setWatch", "default", "doWatch"));

