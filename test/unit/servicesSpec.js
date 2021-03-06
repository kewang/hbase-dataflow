// refs. http://www.benlesh.com/2013/06/angular-js-unit-testing-services.html

describe("Services", function() {
  var Table;
  var Row;
  var Family;
  var Column;
  var Value;

  beforeEach(function() {
    module("hbase-dataflow-app.services");

    inject(function(_Table_, _Row_, _Family_, _Column_, _Value_) {
      Table = _Table_;
      Row = _Row_;
      Family = _Family_;
      Column = _Column_;
      Value = _Value_;
    });
  });

  function toJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  it("should to instantiate Value", function() {
    var testValue = new Value("hello");

    expect(testValue.getValue()).toBe("hello");
  });

  it("should to instantiate Column", function() {
    var testColumn = new Column("testColumn");
    var testValue = new Value("hello");

    testColumn.setValue(testValue);

    expect(testColumn.getValue().getValue()).toBe("hello");

    testValue = new Value("world");

    testColumn.setValue(testValue);

    expect(testColumn.getValue().getValue()).toBe("world");

    testValue = new Value("kewang");

    testColumn.setValue(testValue);

    expect(testColumn.getValue().getValue()).toBe("kewang");

    testValue = new Value("hahaha");

    testColumn.setValue(testValue);

    expect(testColumn.getValue().getValue()).toBe("hahaha");

    expect(testColumn.getName()).toBe("testColumn");
  });

  it("should to instantiate Family", function() {
    var testFamily = new Family("testFamily");
    var testColumn1 = new Column("testColumn1");
    var testColumn2 = new Column("testColumn2");
    var testValue = new Value("hello");

    testColumn1.setValue(testValue);

    testValue = new Value("world");

    testColumn2.setValue(testValue);

    testFamily.addColumn(testColumn1);
    testFamily.addColumn(testColumn2);

    expect(testFamily.getName()).toBe("testFamily");
    expect(testFamily.getColumns()[0]).toBe(testColumn1);
    expect(testFamily.getColumns()[1]).toBe(testColumn2);
    expect(testFamily.findColumnByName("testColumn1")).toBe(testColumn1);
    expect(testFamily.findColumnByName("testColumn3")).toBe(null);
  });

  it("should to instantiate Row", function() {
    var testRow = new Row("testRow")
      .addColumn("testFamily:testColumn", "hello")
      .addColumn("testFamily:testColumn", "world")
      .addColumn("testFamily2:testColumn3", "kewang")
      .addColumn("testFamily2:testColumn4", "hahaha", 50000)
      .addColumn("testFamily2:testColumn4", "xdxdxd", 40000)
      .addColumn("testFamily2:testColumn4", "asdfasfsafd", 99999)
      .addColumn("testFamily2:testColumn4", "mitake", 100000);

    expect(testRow.getKey()).toBe("testRow");
    expect(testRow.getColumns()).not.toBe(null);
    expect(testRow.findColumnByName("testFamily:testColumn")).not.toBe(null);
    expect(testRow.findColumnByName("testFamily:testColumn").getValue().getValue()).toBe("world");
    expect(testRow.findColumnByName("testFamily:testColumnNotFound")).toBe(null);
    expect(testRow.findColumnValueByName("testFamily:testColumnNotFound")).toBe(null);
    expect(testRow.findColumnValueByName("testFamily:testColumn").getValue()).toBe("world");
    expect(testRow.findColumnValueByName("testFamily2:testColumn4").getValue()).toBe("mitake");
    expect(testRow.findColumnValueByName("testFamily2:testColumn4", 50000).getValue()).toBe("hahaha");
  });

  it("should to instantiate Table", function() {
    var testRow = new Row("testRow")
      .addColumn("testFamily:testColumn", "hello")
      .addColumn("testFamily:testColumn", "world")
      .addColumn("testFamily2:testColumn3", "kewang")
      .addColumn("testFamily2:testColumn4", "hahaha", 50000)
      .addColumn("testFamily2:testColumn4", "xdxdxd", 40000)
      .addColumn("testFamily2:testColumn4", "asdfasfsafd", 99999)
      .addColumn("testFamily2:testColumn4", "mitake", 100000);

    var testTable = new Table("testTable");

    testTable.addRow(testRow);

    expect(testTable.getName()).toBe("testTable");
    expect(testTable.getRows()).not.toBe(null);
    expect(testTable.findRowByKey("testRow")).toBe(testRow);

    testRow = new Row("testRow2")
      .addColumn("testFamily:testColumn", "hello")
      .addColumn("testFamily:testColumn", "world")
      .addColumn("testFamily2:testColumn3", "kewang")
      .addColumn("testFamily2:testColumn4", "hahaha", 50000)
      .addColumn("testFamily2:testColumn4", "xdxdxd", 40000)
      .addColumn("testFamily2:testColumn4", "asdfasfsafd", 99999)
      .addColumn("testFamily2:testColumn4", "mitake", 100000);

    testTable.addRow(testRow);

    expect(testTable.scanRowsByKey("testRow")).not.toBe(null);
  });
});