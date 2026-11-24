import type { KnipConfig } from "knip";

export default {
	entry: ["src/**/*.test.*"],
	ignoreDependencies: ["gulp", "gulp-typescript"],
	ignoreExportsUsedInFile: { interface: true, type: true },
	project: ["src/**/*.ts!"],
	treatConfigHintsAsErrors: true,
} satisfies KnipConfig;
