import gulp from "gulp";
import ts from "gulp-typescript";

import { transformerProgram } from "../lib/index.js";

gulp.task("default", function () {
	return gulp
		.src("./index.ts")
		.pipe(
			ts({
				getCustomTransformers: (program) => ({
					before: [transformerProgram(program)],
				}),
			}),
		)
		.pipe(gulp.dest("."));
});
