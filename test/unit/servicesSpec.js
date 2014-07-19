// refs. http://www.benlesh.com/2013/06/angular-js-unit-testing-services.html

describe("Services", function() {
	var Column;

	beforeEach(function() {
		module("hbase-dataflow-app.services");

		inject(function(_Column_) {
			Column = _Column_;
		});
	});

	it("should to instantiate Column", function() {
		var a = new Column("bbb");

		a.setValue("hello");

		expect(a.getValue()).toBe("hello");

		a.setValue("world");

		expect(a.getValue()).toBe("world");

		a.setValue("kewang");

		expect(a.getValue()).toBe("kewang");

		a.setValue("hahaha");

		expect(a.getValue()).toBe("hahaha");

		expect(a.getName()).toBe("bbb");
	});
});