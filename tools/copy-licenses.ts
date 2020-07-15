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

	content = content.replace(/\n/gu, "###")

	let matches = /---(?<yaml>.*?)---(?<text>.*)/gmu.exec(content)

	const yamlText = matches?.groups?.yaml
	const licenseText = matches?.groups?.text

	yamlText || throw new Error("No yaml matched")
	licenseText || throw new Error("No text matched")

	let r = function() {
		return String.prototype.replace.call(this, /###/gu, '\n')
	}

	return [ yaml.safeLoad(yamlText::r()), licenseText::r().trim() ]
}

interface LicenseEntry {
	title: string
	'spdx-id': string
	nickname?: string
	redirect_from?: string
	hidden?: boolean
	description: string
	how: string
	using: Record<string, string>[]
	permissions: string[]
	conditions: string[]
	limitations: string[]
	file: string
}

interface Metadata {
	licenses: LicenseEntry
}

async function copyLicenses() {
	const inDir = path.join(__dirname, "../choosealicense.com/_licenses");
	const outDir = path.join(__dirname, "../build/licenses");

	ensure(outDir).exists();


	const metadata: Metadata = {
		licenses: []
	}

	const files = await fs.promises.readdir(inDir)
	for(const file of files) {
		const inn = path.resolve(?, file)

		const content = await fs.promises.readFile(inn(inDir))
		let [ licenseData, licenseText]: [LicenseEntry, string] = content::extractMetadata()

		licenseData.file = licenseData["spdx-id"]?.toLowerCase() + ".txt"
		metadata.licenses.push(licenseData)

		await fs.promises.writeFile(inn(outDir), licenseText)
	}
	const metadataFile = path.join(__dirname, '../build/metadata.json')
	await fs.promises.writeFile(metadataFile, JSON.stringify(metadata, null, 2))
}

copyLicenses().catch((err) => {
	console.error(err);
});
