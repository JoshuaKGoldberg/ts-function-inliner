<h1 align="center">ts-function-inliner</h1>

<p align="center">TypeScript transformation that inlines calls to small functions. ⚡️</p>

<p align="center">
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors-">
		<img alt="All Contributors" src="https://img.shields.io/badge/all_contributors-1-21bb42.svg" />
	</a>
	<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<img alt="Code Style: Prettier" src="https://img.shields.io/badge/code_style-prettier-21bb42.svg" />
	<a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/blob/main/.github/CODE_OF_CONDUCT.md">
		<img alt="Contributor Covenant" src="https://img.shields.io/badge/code_of_conduct-contributor_covenant-21bb42" />
	</a>
	<a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/blob/main/LICENSE.md">
	    <img alt="License: MIT" src="https://img.shields.io/github/license/JoshuaKGoldberg/ts-function-inliner?color=21bb42">
    </a>
	<a href="https://github.com/sponsors/JoshuaKGoldberg">
    	<img alt="Sponsor: On GitHub" src="https://img.shields.io/badge/sponsor-on_github-21bb42.svg" />
    </a>
    <img alt="TypeScript: Strict" src="https://img.shields.io/badge/typescript-strict-21bb42.svg" />
</p>

## Explanation

Many projects choose to extract common shared logic into small helper functions.
TypeScript projects often use small [user-defined type guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) to inform type narrowing.
Unfortunately, the overhead of extracting logic into functions can hurt application performance before JIT optimizers fully kick in.[^1]

This TypeScript transformation plugin detects calls to small one-line functions and inlines them in the output JavaScript.
The resultant code will function the same regardless of the transformation.

### Example

Given the following function:

```ts
function isNotFalsy(value: unknown) {
	return !!value;
}
```

Before:

```ts
isNotFalsy("Hello!");
```

After:

```ts
!!"Hello!";
```

> Note: this transformer does not remove the original function declarations.
> Use a separate tool after the transform, such as [Terser](https://github.com/terser/terser), if you'd like to configure that.

## Usage

```shell
npm i ts-function-inliner
```

Per [github.com/Microsoft/TypeScript/issues/14419](https://github.com/Microsoft/TypeScript/issues/14419), TSConfig plugins don't support transformers.
However, you can use this in other pipelines.

### Usage with Gulp

Specify it as a custom transformer with [gulp-typescript](https://github.com/ivogabe/gulp-typescript):

```js
import gulp from "gulp";
import ts from "gulp-typescript";
import { transformerProgram } from "ts-function-inliner";

gulp.task("typescript", function () {
	gulp
		.src("src/**/*.ts")
		.pipe(
			ts({
				getCustomTransformers: (program) => ({
					before: [transformerProgram(program)],
				}),
			})
		)
		.pipe(gulp.dest("dist"));
});
```

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md).
Thanks! 💖

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="http://www.joshuakgoldberg.com"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg"/><br /><sub><b>Josh Goldberg</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/issues?q=author%3AJoshuaKGoldberg" title="Bug reports">🐛</a> <a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="#example-JoshuaKGoldberg" title="Examples">💡</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#platform-JoshuaKGoldberg" title="Packaging/porting to new platform">📦</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a> <a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/pulls?q=is%3Apr+reviewed-by%3AJoshuaKGoldberg" title="Reviewed Pull Requests">👀</a> <a href="#security-JoshuaKGoldberg" title="Security">🛡️</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a> <a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/commits?author=JoshuaKGoldberg" title="Tests">⚠️</a></td>
    </tr>
  </tbody>
  <tfoot>
    
  </tfoot>
</table>

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

[^1]: See [Microsoft/TypeScript: Added some Type type predicates internally #50010](https://github.com/microsoft/TypeScript/pull/50010), which caused a 1-2% performance hit in TypeScript.
