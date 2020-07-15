class License {
	raw() {}
	text(obj: { year: string | undefined; number: string | undefined }) {
		console.log(obj.year, obj.number);
	}
}

const license = new License();
license.text({ year: "year", number: "n" });
