<h1 align="center">TypeScript Function Inliner</h1>

<p align="center">
	TypeScript transformation that inlines calls to small functions.
	⚡️
</p>

<p align="center">
	<!-- prettier-ignore-start -->
	<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
	<a href="#contributors" target="_blank"><img alt="👪 All Contributors: 1" src="https://img.shields.io/badge/%F0%9F%91%AA_all_contributors-1-21bb42.svg" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
	<!-- prettier-ignore-end -->
	<a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/blob/main/.github/CODE_OF_CONDUCT.md" target="_blank"><img alt="🤝 Code of Conduct: Kept" src="https://img.shields.io/badge/%F0%9F%A4%9D_code_of_conduct-kept-21bb42" /></a>
	<a href="https://codecov.io/gh/JoshuaKGoldberg/ts-function-inliner" target="_blank"><img alt="🧪 Coverage" src="https://img.shields.io/codecov/c/github/JoshuaKGoldberg/ts-function-inliner?label=%F0%9F%A7%AA%20coverage" /></a>
	<a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/blob/main/LICENSE.md" target="_blank"><img alt="📝 License: MIT" src="https://img.shields.io/badge/%F0%9F%93%9D_license-MIT-21bb42.svg" /></a>
	<a href="http://npmjs.com/package/ts-function-inliner" target="_blank"><img alt="📦 npm version" src="https://img.shields.io/npm/v/ts-function-inliner?color=21bb42&label=%F0%9F%93%A6%20npm" /></a>
	<img alt="💪 TypeScript: Strict" src="https://img.shields.io/badge/%F0%9F%92%AA_typescript-strict-21bb42.svg" />
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
export function isNotFalsy(value: unknown) {
	return !!value;
}
```

Before:

```ts
export const value = isNotFalsy("Hello!");
```

After:

```ts
export const value = !!"Hello!";
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

```ts
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
			}),
		)
		.pipe(gulp.dest("lib"));
});
```

## Development

See [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md), then [`.github/DEVELOPMENT.md`](./.github/DEVELOPMENT.md).
Thanks! ⚡

## Contributors

<!-- spellchecker: disable -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.joshuakgoldberg.com"><img src="https://avatars.githubusercontent.com/u/3335181?v=4?s=100" width="100px;" alt="Josh Goldberg"/><br /><sub><b>Josh Goldberg</b></sub></a><br /><a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/commits?author=JoshuaKGoldberg" title="Code">💻</a> <a href="#ideas-JoshuaKGoldberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-JoshuaKGoldberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-JoshuaKGoldberg" title="Maintenance">🚧</a> <a href="#tool-JoshuaKGoldberg" title="Tools">🔧</a> <a href="#content-JoshuaKGoldberg" title="Content">🖋</a> <a href="https://github.com/JoshuaKGoldberg/ts-function-inliner/commits?author=JoshuaKGoldberg" title="Documentation">📖</a> <a href="#projectManagement-JoshuaKGoldberg" title="Project Management">📆</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- spellchecker: enable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

> 💝 This package was templated with [`create-typescript-app`](https://github.com/JoshuaKGoldberg/create-typescript-app) using the [Bingo engine](https://create.bingo).

[^1]: See [Microsoft/TypeScript: Added some Type type predicates internally #50010](https://github.com/microsoft/TypeScript/pull/50010), which caused a 1-2% performance hit in TypeScript.
