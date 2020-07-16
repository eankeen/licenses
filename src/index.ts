import metadata from './metadata.json'

import path from 'path'
import fs from 'fs'

interface Specilizer {
	name: string
	year: number
}

class License {
	licenseEntry: LicenseEntry

	constructor(entry: LicenseEntry) {
		this.licenseEntry = entry
	}

	#licensePath(): string {
		return path.join(
			__dirname,
			'licenses/choose-a-license',
			this.licenseEntry.file
		)
	}
	data() {
		return licenseEntry
	}
	textRaw(): Promise<string> {
		return fs.promises.readFile(this.#licensePath(), 'utf8')
	}
	textRawSync(): string {
		return fs.readFileSync(this.#licensePath(), 'utf8')
	}
	async text({ year, fullname }: Specilizer): Promise<string> {
		let content = (await fs.promises.readFile(
			this.#licensePath(),
			'utf8'
		)) as string
		content = content.replace(/\[year\]/gu, year)
		content = content.replace(/\[fullname\]/gu, String(fullname))
		return content
	}
	textSync({ year, fullname }: Specilizer): string {
		let content = fs.readFileSync(this.#licensePath(), 'utf8') as string
		content = content.replace(/\[year\]/gu, year)
		content = content.replace(/\[fullname\]/gu, String(fullname))
		return content
	}
}

export class Licenses {
	list(): LicenseEntry[] {
		return metadata.licenses
	}
	get(spdxId: string): License | undefined {
		for (const license of metadata.licenses) {
			if (spdxId === license['spdx-id']) {
				return new License(license)
			}
		}
	}
}
