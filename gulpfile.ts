/**
 * Gulpfile to start TypeScript project rapidly with bootstrap
 * @author Dmitry Rodichev <seogarry@gmail.com>
 */
import { Gulpclass, Task, SequenceTask } from "gulpclass";
import * as gulp from "gulp";
import * as del from "del";
import * as GulpSass from "gulp-sass";
import * as GulpMinify from "gulp-minify";
import * as GulpCleanCss from "gulp-clean-css";
import * as GulpConcat from "gulp-concat";
import * as GulpWatch from "gulp-watch";
import * as GulpTypeScript from "gulp-typescript";
import * as GulpConnect from "gulp-connect";

@Gulpclass()
export class Gulpfile {

    paths = {
        deps: {
            styles: [
                "./node_modules/bootstrap/dist/css/bootstrap.min.css"
            ],
            scripts: [
                "./node_modules/bootstrap/dist/js/bootstrap.min.js",
                "./node_modules/jquery/dist/jquery.min.js"
            ]
        },
        src: {
            tsProject: "./src",
            styles: [
                "./src/**/*.scss"
            ],
            scripts: [
                "./src/**/*.ts"
            ],
            templates: [
                "./src/**/*.html"
            ],
            assets: [],
        },
        dest: "./dist",
        build: "./build"
    };

    @Task("clean")
    clean(cb: Function) {
        return del([this.paths.dest + "/**", this.paths.build]);
    }

    @Task("copy-styles")
    coptStyles() {
        return gulp.src(this.paths.deps.styles)
            .pipe(GulpCleanCss())
            .pipe(GulpConcat("style.css"))
            .pipe(gulp.dest(this.paths.build + "/stylesheets"));
    }

    @Task("build-styles", ["copy-styles"])
    buildStyles() {
        return gulp.src(this.paths.src.styles)
            .pipe(GulpSass().on("error", GulpSass.logError))
            .pipe(gulp.dest(this.paths.build));
    }

    @Task("dist-styles", ["build-styles"])
    distStyles() {
        return gulp.src([this.paths.build + "/stylesheets/*.css"])
            .pipe(GulpCleanCss())
            .pipe(GulpConcat("styles.css"))
            .pipe(gulp.dest(this.paths.dest));
    }

    @Task("build-scripts")
    buildScripts() {
        return gulp.src(this.paths.deps.scripts)
            .pipe(gulp.dest(this.paths.build + "/scripts"));
    }

    @Task("dist-scripts", ["build-scripts"])
    distScripts() {
        return gulp.src(this.paths.build + "/scripts/*.js")
            .pipe(GulpConcat("scripts.js"))
            .pipe(gulp.dest(this.paths.dest));
    }

    @Task("build-ts")
    buildTs() {
        let tsProject = GulpTypeScript.createProject(this.paths.src.tsProject + "/tsconfig.json");
        return tsProject.src()
            .pipe(tsProject())
            .js.pipe(gulp.dest(this.paths.dest));
    }

    @Task("dist-templates")
    distTemplates() {
        return gulp.src(this.paths.src.templates)
            .pipe(gulp.dest(this.paths.dest))
            .pipe(GulpConnect.reload());
    }

    @Task("watch")
    watch() {
        gulp.watch(this.paths.src.styles, ["dist-styles"]);
        gulp.watch(this.paths.src.styles, ["dist-scripts"]);
        gulp.watch(this.paths.src.scripts, ["build-ts"]);
        gulp.watch(this.paths.src.templates, ["dist-templates"]);
    }

    @Task("serve")
    serve() {
        return GulpConnect.server({
            root: this.paths.dest,
            livereload: true
        });
    }

    @SequenceTask()
    build() {
        return ["clean", "dist-styles", "dist-scripts", "build-ts", "dist-templates"];
    }

    @Task("default", ["build", "serve", "watch"])
    defaultTask() {

    }
}
