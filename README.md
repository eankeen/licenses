# licenses

List of all licenses shown on choosealicense.com. A complete list from SPDX is also in this repository, but it's not included in the package

## Usage

Soon to be 100% up to date

```js
const licenses = new Licenses();
const license = licenses.get("MIT");
const licenseText = await license.textRaw();
```
