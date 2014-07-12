describe("Services", function(){
	var service;

	beforeEach(module("hbase-dataflow-app.services"));

	describe("Column", function(){
		it("xxx", inject(function(Column){
			var c = new Column("aaa");

			expect(c.getName()).toEqual("aaa");
		}));
	});
});