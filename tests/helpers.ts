import { rollup, OutputChunk, OutputAsset } from "rollup";

export function noop() { }

export const getChunksSnapshot = (chunks: OutputChunk[]) => chunks.map(chunk => {
	const whiteList = [
		"code",
		"fileName",
		"name",
		"isDynamicEntry",
		"isEntry",
		"isImplicitEntry",
		"map",
	] as const;

	const obj = {} as Pick<OutputChunk, typeof whiteList[number]>;
	whiteList.forEach(key => {
		// @ts-ignore
		obj[key] = key === "code"
			? chunk[key].replace(/\r\n/g, "\n") // normalize for windows.
			: chunk[key];
	});
	return obj;
});

export const getAssetsSnapshot = (assets: OutputAsset[]) => assets.map(asset => {
	const whiteList = [
		"fileName",
		"name",
	] as const;

	const obj = {} as Pick<OutputAsset, typeof whiteList[number]>;

	// @ts-ignore
	whiteList.forEach(key => obj[key] = asset[key]);

	return obj;
});
