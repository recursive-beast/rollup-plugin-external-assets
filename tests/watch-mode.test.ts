import path from "path";
import fs from "fs/promises";
import { RollupWatcher, watch } from "rollup";
import externalAssets from "../src/index";
import { copyDirToTempdir, getRollupBundle, listenForRebuild } from "./helpers";

type ChangeTrigger = (fixture_dir: string) => Promise<void>;

// Since rollup's addWatchFile context method can be called from a hook that can be cached,
// files might be missing from the watch list after the second rebuild.
// So make sure that's tested.

const specs: [string, string, (ChangeTrigger | string[])[]][] = [
	[
		"without dynamic imports",
		"src/index1.js",
		[
			["assets/text.txt", "assets/image.png", "assets/styles.css"],
			async fixture_dir => await fs.appendFile(path.join(fixture_dir, "assets/text.txt"), "blabla"),
			["assets/text.txt", "assets/image.png", "assets/styles.css"],
			async fixture_dir => await fs.appendFile(path.join(fixture_dir, "assets/image.png"), "blabla"),
			["assets/text.txt", "assets/image.png", "assets/styles.css"],
			async fixture_dir => await fs.appendFile(path.join(fixture_dir, "assets/styles.css"), "blabla"),
			["assets/text.txt", "assets/image.png", "assets/styles.css"],
		],
	],
	[
		"new imports while watching",
		"src/index1.js",
		[
			["assets/text.txt", "assets/image.png", "assets/styles.css"],
			async fixture_dir => await fs.appendFile(path.join(fixture_dir, "assets/image.png"), "blabla"),
			["assets/text.txt", "assets/image.png", "assets/styles.css"],
			async fixture_dir => {
				const filepath = path.join(fixture_dir, "src/index1.js");
				const data = await fs.readFile(filepath);
				const newData = Buffer.concat([
					Buffer.from("import png2 from '../assets/image2.png';\n"),
					data,
					Buffer.from("\nconsole.log(png2);\n"),
				]);

				await fs.writeFile(filepath, newData);
			},
			["assets/text.txt", "assets/image.png", "assets/styles.css", "assets/image2.png"],
			async fixture_dir => await fs.appendFile(path.join(fixture_dir, "assets/styles.css"), "blabla"),
			["assets/text.txt", "assets/image.png", "assets/styles.css", "assets/image2.png"],
			async fixture_dir => {
				const filepath = path.join(fixture_dir, "src/index1.js");
				const data = await fs.readFile(filepath);

				const prefix = "import png2 from '../assets/image2.png';\n";
				const suffix = "\nconsole.log(png2);\n";
				const newData = data.subarray(prefix.length, data.length - suffix.length);

				await fs.writeFile(filepath, newData);
			},
			["assets/text.txt", "assets/image.png", "assets/styles.css"],
		],
	],
];

const watchers = new Map<string, RollupWatcher>();

afterEach(() => {
	const title = expect.getState().currentTestName;
	watchers.get(title)?.close();
	watchers.delete(title);
});

jest.setTimeout(10000);

test.each(specs)("%s", async (title, inputFixture, sequence) => {
	const tempdir = await copyDirToTempdir("tests/fixtures");

	// Resolve asset filenames to absolute paths.
	sequence = sequence.map(elem => {
		if (typeof elem === "function") return elem;
		return elem.map(file => path.join(tempdir, file));
	});

	const bundle = await getRollupBundle({
		input: path.join(tempdir, inputFixture),
		plugins: [externalAssets(path.join(tempdir, "assets/*"))],
	});

	// Test the initial build, I couldn't find a way to test everything asynchronously,
	// so i'm testing the initial build without watch-mode.
	expect(bundle.watchFiles).toEqual(expect.arrayContaining(sequence[0] as string[]));

	const watcher = watch({
		input: path.join(tempdir, inputFixture),
		plugins: [externalAssets(path.join(tempdir, "assets/*"))],
		output: { dir: path.join(tempdir, "out") },
		watch: { skipWrite: false },
	});

	watchers.set(expect.getState().currentTestName, watcher);

	// Wait for the initial build to end.
	await new Promise(resolve => setTimeout(resolve, 1000));

	for (let i = 1; i < sequence.length; i += 2) {
		const changeTrigger = (sequence[i] as ChangeTrigger).bind(null, tempdir);
		const bundle = await listenForRebuild(watcher, changeTrigger);

		expect(bundle.watchFiles).toEqual(expect.arrayContaining(sequence[i + 1] as string[]));
	}
});

test.todo("with dynamic imports");
