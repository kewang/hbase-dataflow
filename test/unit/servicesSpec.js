describe("Services", function(){
	var Column;

	beforeEach(function(){
		module("hbase-dataflow-app.services")

		inject(function(_Column_){
			Column = _Column_;
		});
	});

	it("should to instantiate Column", function(){
		var a = new Column("bbb");

		expect(a.getName()).toBe("bbb");
	});
});