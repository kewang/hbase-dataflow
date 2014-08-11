"use strict";

var app = angular.module("hbase-dataflow-app.services", []);

// imitate http://www.bennadel.com/blog/2527-defining-instantiatable-classes-in-the-angularjs-dependency-injection-framework.htm
app.factory("Table", function(Row) {
  var entities = [];

  function Table(name) {
    this.name = name;
    this.rows = [];
  }

  // FIXME: current not ordered
  Table.prototype.addRow = function(row) {
    this.rows.push(row);

    return this;
  };

  Table.prototype.getName = function() {
    return this.name;
  };

  Table.prototype.createRow = function(key) {
    var row = new Row(key);

    this.rows.push(row);

    return row;
  };

  Table.prototype.getRows = function() {
    return this.rows;
  };

  Table.prototype.removeRow = function(row) {
    for (var i = 0; i < this.rows.length; i++) {
      if (this.rows[i] === row) {
        this.rows.splice(i, 1);

        break;
      }
    }
  };

  Table.prototype.findRowByKey = function(key) {
    for (var i = 0; i < this.rows.length; i++) {
      if (this.rows[i].getKey() === key) {
        return this.rows[i];
      }
    }

    return null;
  };

  //from prefix
  Table.prototype.scanRowsByKey = function(key) {
    var found = [];

    for (var i = 0; i < this.rows.length; i++) {
      if (this.rows[i].getKey().indexOf(key) === 0) {
        found.push(this.rows[i]);
      }
    }

    return found;
  };

  Table.prototype.isEmpty = function() {
    return (this.rows.length === 0);
  };

  Table.create = function(table) {
    entities.push(table);
  };

  Table.findAll = function() {
    return entities;
  };

  Table.findByName = function(name) {
    var found;

    for (entity in entities) {
      if (entity.name === name) {
        found = entity;

        break;
      }
    }

    return found;
  };

  Table.clear = function() {
    entities = [];
  };

  return Table;
});

app.factory("Row", function(Family, Column, Value) {
  function Row(key) {
    this.key = key;
    this.families = [];

    return this;
  }

  Row.prototype.setKey = function(key) {
    this.key = key;

    return this;
  };

  Row.prototype.addColumn = function(name, value, timestamp) {
    var str = name.split(":");
    var family = new Family(str[0]);
    var found = false;

    for (var i = 0; i < this.families.length; i++) {
      // append to exist family
      if (this.families[i].getName() === family.getName()) {
        var column = this.families[i].findColumnByName(str[1]);
        var value = new Value(value, timestamp);

        if (column === null) {
          column = new Column(str[1]);

          this.families[i].addColumn(column);
        }

        column.setValue(value);

        found = true;

        break;
      }
    }

    // add new family & column
    if (!found) {
      var column = new Column(str[1]);
      var value = new Value(value, timestamp);

      column.setValue(value);

      family.addColumn(column);

      this.families.push(family);
    }

    return this;
  };

  Row.prototype.getColumns = function() {
    return this.families;
  };

  Row.prototype.findColumnByName = function(name) {
    var families = this.getColumns();
    var str = name.split(":");
    var familyString = str[0];
    var columnString = str[1];

    for (var i = 0; i < families.length; i++) {
      var family = families[i];

      if (family.getName() === familyString) {
        var columns = family.getColumns();

        for (var j = 0; j < columns.length; j++) {
          var column = columns[j];

          if (column.getName() === columnString) {
            return column;
          }
        }

        return null;
      }
    }

    return null;
  };

  Row.prototype.findColumnValueByName = function(name, timestamp) {
    var column = this.findColumnByName(name);

    return column && column.getValue(timestamp);
  };

  Row.prototype.getKey = function() {
    return this.key;
  };

  return Row;
});

app.factory('Family', function() {
  function Family(name) {
    this.name = name;
    this.columns = [];
  }

  Family.prototype.addColumn = function(column) {
    this.columns.push(column);
  };

  Family.prototype.getColumns = function() {
    return this.columns;
  };

  Family.prototype.getName = function() {
    return this.name;
  };

  Family.prototype.findColumnByName = function(name) {
    for (var i = 0; i < this.columns.length; i++) {
      if (this.columns[i].getName() === name) {
        return this.columns[i];
      }
    }

    return null;
  };

  return Family;
});

app.factory("Column", function(Value) {
  Column.VERSIONS = 3;

  function Column(name, versions) {
    this.name = name;
    this.values = [];
    this.versions = versions || Column.VERSIONS;

    for (var i = 0; i < this.versions; i++) {
      this.values.push(null);
    }
  }

  Column.prototype.setName = function(name) {
    this.name = name;
  };

  Column.prototype.getName = function() {
    return this.name;
  };

  Column.prototype.setValue = function(value) {
    var set = false;

    for (var i = this.values.length - 1; i >= 0; i--) {
      if (this.values[i] !== null) {
        if (i !== this.values.length - 1) {
          if (this.values[i].getTimestamp() > value.getTimestamp()) {
            set = true;

            this.values[i + 1] = value;
          } else {
            var copyValue = new Value(this.values[i].getValue(), this.values[i].getTimestamp());

            this.values[i + 1] = copyValue;

            if (i === 0) {
              set = true;

              this.values[0] = value;
            }
          }
        }
      }
    }

    if (!set) {
      this.values[0] = value;
    }
  };

  Column.prototype.getValue = function(timestamp) {
    if (timestamp) {
      for (var i = 0; i < this.values.length; i++) {
        if (this.values[i].getTimestamp() === timestamp) {
          return this.values[i];
        }
      }

      return null;
    } else {
      return this.values[0];
    }
  };

  Column.prototype.getValues = function() {
    return this.values;
  };

  return Column;
});

app.factory("Value", function() {
  function Value(value, timestamp) {
    this.value = value;
    this.timestamp = timestamp || Date.now();
  }

  Value.prototype.getValue = function() {
    return this.value;
  };

  Value.prototype.getTimestamp = function() {
    return this.timestamp;
  };

  return Value;
});

app.factory("Operation", function() {
  Operation.Type = {
    CREATE: 0,
    UPDATE: 1,
    GET: 2,
    OTHER: 3
  };

  var entities = [];

  function Operation(title, type) {
    this.title = title;
    this.type = type;
  }

  Operation.prototype.getTitle = function() {
    return this.title;
  };

  Operation.prototype.getType = function() {
    return this.type;
  };

  Operation.prototype.getSummary = function() {
    return this.summary;
  };

  Operation.prototype.getTableName = function() {
    return this.tableName;
  };

  Operation.prototype.addRow = function(row) {
    this.rows = this.rows || [];

    this.rows.push(row);

    return this;
  };

  Operation.prototype.getRows = function() {
    return this.rows;
  };

  Operation.prototype.setSummary = function(summary) {
    this.summary = summary;

    return this;
  };

  Operation.prototype.setTableName = function(name) {
    this.tableName = name;

    return this;
  };

  Operation.create = function(operation) {
    entities.push(operation);
  };

  Operation.findAll = function() {
    return entities;
  };

  Operation.clear = function() {
    entities = [];
  };

  return Operation;
});

app.factory("ImportService", function(Table, Row, Operation) {
  function ImportService() {}

  ImportService.import = function(data) {
    var tables = [];
    var operations = [];

    function buildDataToRow(rows, callback) {
      for (var j = 0; j < rows.length; j++) {
        var row = new Row(rows[j].key);
        var families = rows[j].families;

        for (var k = 0; k < families.length; k++) {
          var columns = families[k].columns;

          for (var l = 0; l < columns.length; l++) {
            var values = columns[l].values;

            for (var m = values.length - 1; m >= 0; m--) {
              if (values[m] && values[m].value) {
                row.addColumn(families[k].name + ":" + columns[l].name, values[m].value, values[m].timestamp);
              }
            }
          }
        }

        callback(row);
      }
    }

    if (data.tables) {
      for (var i = 0; i < data.tables.length; i++) {
        var table = new Table(data.tables[i].name);
        var rows = data.tables[i].rows;

        buildDataToRow(rows, function(row) {
          table.addRow(row);
        });

        tables.push(table);
      }
    }

    if (data.operations) {
      for (var i = 0; i < data.operations.length; i++) {
        var operation = new Operation(data.operations[i].title, data.operations[i].type);

        operation.setSummary(data.operations[i].summary);

        if (operation.getType() !== Operation.Type.OTHER) {
          operation.setTableName(data.operations[i].tableName);

          buildDataToRow(data.operations[i].rows, function(row) {
            operation.addRow(row);
          });
        }

        operations.push(operation);
      }
    }

    return {
      "tables": tables,
      "operations": operations
    };
  };

  return ImportService;
});

app.factory("Utils", function(Row) {
  function Utils() {}

  Utils.generateId = function(length) {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    length = length || 6;

    for (var i = 0; i < length; i++) {
      id += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return id;
  };

  return Utils;
});