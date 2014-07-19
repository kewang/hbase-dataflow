// refs. http://www.benlesh.com/2013/06/angular-js-unit-testing-services.html

describe("Services", function() {
  var Column;
  var Family;

  var testColumn;
  var testFamily;

  beforeEach(function() {
    module("hbase-dataflow-app.services");

    inject(function(_Family_, _Column_) {
      Family = _Family_;
      Column = _Column_;
    });
  });

  it("should to instantiate Column", function() {
    var testColumn = new Column("bbb");

    testColumn.setValue("hello");

    expect(testColumn.getValue()).toBe("hello");

    testColumn.setValue("world");

    expect(testColumn.getValue()).toBe("world");

    testColumn.setValue("kewang");

    expect(testColumn.getValue()).toBe("kewang");

    testColumn.setValue("hahaha");

    expect(testColumn.getValue()).toBe("hahaha");

    expect(testColumn.getName()).toBe("bbb");
  });
});