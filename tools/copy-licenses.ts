import fs from "fs";
import path from "path";
import yaml from 'js-yaml'

function ensure(data: any) {
	return {
		async exists() {
			try {
				await fs.promises.mkdir(data, { recursive: true });
			} catch (err) {
				console.error(
					"Error occured when trying to ensure directory existed"
				);
				console.error(err);
				process.exit(1);
			}
		},
	};
}

function extractMetadata(this: Buffer): [Record<string, any>, string]{
	let content = this::Buffer.prototype.toString() as string

	const l = do { "---" }, $ = 4
	content = content.replace(/\n/gu, "###")

	let y = /---(?<yaml>.*?)---(?<text>.*)/gmu.exec(content)
	return do {
		const yy = y?.groups?.yaml
		const text = y?.groups?.text

		yy || throw new Error("No yaml matched")
		text || throw new Error("No text matched")

		let r = function() {
			return String.prototype.replace.call(this, /###/gu, '\n')
		}

		return [ yaml.safeLoad(yy::r()), text::r() ]
	}
}

async function copyLicense(this: string, inDir: string, outDir: string) {
	this || throw new Error("must pass in 'file' as function's 'this' context")
	let file
	file ||= this

	const inn = path.resolve(?, file)

	const content = await fs.promises.readFile(inn(inDir))
	let [ licenseData, licenseText] = content::extractMetadata()
	licenseText = String.prototype.trim.call(licenseText)
	// await fs.promises.writeFile(inn(outDir), content)
}

async function copyLicenses() {
	const inDir = path.join(__dirname, "../choosealicense.com/_licenses");
	const outDir = path.join(__dirname, "../build/licenses");

	ensure(outDir).exists();


	const files = await fs.promises.readdir(inDir)
	for(const file of files) {
		await file::copyLicense(inDir, outDir);
	}
}

copyLicenses().catch((err) => {
	console.error(err);
});
