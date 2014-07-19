// refs. http://www.benlesh.com/2013/06/angular-js-unit-testing-services.html

describe("Services", function() {
  var Column;
  var Family;

  beforeEach(function() {
    module("hbase-dataflow-app.services");

    inject(function(_Family_, _Column_) {
      Family = _Family_;
      Column = _Column_;
    });
  });

  it("should to instantiate Column", function() {
    var testColumn = new Column("testColumn");

    testColumn.setValue("hello");

    expect(testColumn.getValue()).toBe("hello");

    testColumn.setValue("world");

    expect(testColumn.getValue()).toBe("world");

    testColumn.setValue("kewang");

    expect(testColumn.getValue()).toBe("kewang");

    testColumn.setValue("hahaha");

    expect(testColumn.getValue()).toBe("hahaha");

    expect(testColumn.getName()).toBe("testColumn");
  });

  it("should to instantiate Family", function() {
    var testFamily = new Family("testFamily");
    var testColumn1 = new Column("testColumn1");
    var testColumn2 = new Column("testColumn2");

    testColumn1.setValue("hello");
    testColumn2.setValue("world");

    testFamily.addColumn(testColumn1);
    testFamily.addColumn(testColumn2);

    expect(testFamily.getName()).toBe("testFamily");
    expect(testFamily.getColumns()[0]).toBe(testColumn1);
    expect(testFamily.getColumns()[1]).toBe(testColumn2);
    expect(testFamily.findColumnByName("testColumn1")).toBe(testColumn1);
    expect(testFamily.findColumnByName("testColumn3")).toBe(null);
  });
});