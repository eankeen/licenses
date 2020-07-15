const fs = require("fs");
const path = require("path");
const { dest, parallel, src } = require("gulp");
const plumber = require("gulp-plumber");
const replace = require("gulp-replace");
const { default: print } = require("gulp-print");
const rename = require("gulp-rename");
const File = require("vinyl");
const through2 = require("through2");
const yaml = require("js-yaml");

/**
 * @typedef {object} CustomLicense
 * @property {number} year
 * @property {string} fullname
 */

/**
 * @typedef {object} IRename
 * @property {string} dirname
 * @property {string} basename
 * @property {string} extname
 */

/** @type {string[]} */
globalThis.licenseList = [];

const year = 2020;
const fullname = "Edwin Kofler";

exports.default = async function () {
	await src("./choosealicense.com/_licenses/*.txt")
		.pipe(plumber())
		.pipe(
			rename((/** @type {IRename} */ name) => {
				return name.basename + ".old.txt";
			})
		)
		.pipe(print())
		// .pipe(replace(/\[year\]/giu, year))
		// .pipe(replace(/\[fullname\]/giu, fullname))
		.pipe(
			createData({
				year,
				fullname,
			})
		)
		.pipe(dest("build/licenses/choose-a-license"))
		.pipe(dest("src/licenses/choose-a-license"))
		.on("end", async () => {
			try {
				await final();
			} catch (err) {
				console.error(err);
			}
		});
};

function createData(/** @type CustomLicense */ customLicense) {
	return through2.obj(
		/**
		 * @this {any}
		 * @param {any} file
		 * @param {any} enc
		 * @param {any} next
		 */
		function (file, enc, next) {
			const base = path.join(file.path, "..");

			const licenseFile = path.basename(file.path);
			const licenseFileShort = licenseFile.slice(
				0,
				licenseFile.length - path.extname(licenseFile).length
			);

			const licenseContent = file.contents.toString();
			const [licenseYaml, licenseText] = extractData(licenseContent);

			globalThis.licenseList.push(licenseYaml["spdx-id"]);

			this.push(
				new File({
					base,
					path: path.join(base, `${licenseFileShort}.json`),
					contents: Buffer.from(
						new TextEncoder().encode(JSON.stringify(licenseYaml, null, 2))
					),
				})
			);
			this.push(
				new File({
					base,
					path: path.join(base, `${licenseFileShort}.txt`),
					contents: Buffer.from(new TextEncoder().encode(licenseText)),
				})
			);
			next();
		}
	);
}

/**
 * @param {string} licenseContent
 * @return {[Record<string, any>, string]}
 */
function extractData(licenseContent) {
	licenseContent = licenseContent.replace(/\n/gu, "###");
	let matches = /---(?<yaml>.*?)---(?<text>.*)/gmu.exec(licenseContent);

	let yamlTextPre = matches?.groups?.yaml;
	let licenseTextPre = matches?.groups?.text;

	yamlTextPre || throw new Error("No yaml matched");
	licenseTextPre || throw new Error("No text matched");

	let yamlText = /** @type {string} */ (yamlTextPre);
	let licenseText = /** @type {string} */ (licenseTextPre);

	const replace = (/** @type string */ text) => {
		return String.prototype.replace.call(text, /###/gu, "\n");
	};

	return [yaml.safeLoad(replace(yamlText)), replace(licenseText).trim()];
}

async function final() {
	await fs.promises.writeFile("src/licenses/choose-a-license/.gitkeep", "");

	const licenseListString = JSON.stringify(
		{
			licenseList: globalThis.licenseList,
		},
		null,
		2
	);
	await fs.promises.writeFile(
		"src/licenses/choose-a-license-licenses.json",
		licenseListString
	);
	await fs.promises.writeFile(
		"build/licenses/choose-a-license-licenses.json",
		licenseListString
	);
	console.log(globalThis.licenseList);
}
