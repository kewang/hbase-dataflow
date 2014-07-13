"use strict";

var app = angular.module("hbase-dataflow-app.services", []);

// imitate http://www.bennadel.com/blog/2527-defining-instantiatable-classes-in-the-angularjs-dependency-injection-framework.htm
app.factory("Table", function(Row) {
  var entities = [];

  function Table(name) {
    this.name = name;
    this.rows = [];
  }

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

  Table.prototype.buildFullTable = function() {
    var all_cqs = [];
    var all_rows = [];

    for (var i = 0; i < this.rows.length; i++) {
      var cqs = this.rows[i].cqs;

      for (var j = 0; j < cqs.length; j++) {
        var cq = cqs[j];

        // not found the same CQ
        if (all_cqs.indexOf(cq.name) === -1) {
          all_cqs.push(cq.name);
        }
      }
    }

    for (var i = 0; i < this.rows.length; i++) {
      var tmp_cqs = [];
      var row = this.rows[i];

      for (var j = 0; j < all_cqs.length; j++) {
        var found = false;
        var cqs = row.cqs;

        for (var k = 0; k < cqs.length; k++) {
          var cq = cqs[k];

          if (all_cqs[j] === cq.name) {
            tmp_cqs.push(cq.value);

            found = true;

            break;
          }
        }

        if (!found) {
          tmp_cqs.push(null);
        }
      }

      all_rows.push({
        "key": row.key,
        "cqs": tmp_cqs
      });
    }

    this.fullRowkeys = all_rows;
    this.fullCQs = all_cqs;
  };

  Table.prototype.getFullKeys = function() {
    return this.fullRowkeys;
  };

  Table.prototype.getFullCQs = function() {
    return this.fullCQs;
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
      if (this.rows[i].key === key) {
        return this.rows[i];
      }
    }
  };

  //from prefix
  Table.prototype.scanRowsByKey = function(key) {
    var search = [];

    for (var i = 0; i < this.rows.length; i++) {
      if (this.rows[i].key.indexOf(key) === 0) {
        search.push(this.rows[i]);
      }
    }

    return search;
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

app.factory("Row", function() {
  function Row(key) {
    this.key = key;
    this.cqs = [];
  }

  Row.prototype.getKey = function() {
    return this.key;
  };

  Row.prototype.getCQs = function() {
    return this.cqs;
  };

  Row.prototype.createCQ = function(name, value) {
    this.cqs.push({
      "name": name,
      "value": value
    });
  };

  Row.prototype.updateCQ = function(name, value) {
    for (var i = 0; i < this.cqs.length; i++) {
      if (this.cqs[i].name === name) {
        this.cqs[i].value = value;

        break;
      }
    }
  };

  Row.prototype.removeCQ = function(name) {
    for (var i = 0; i < this.cqs.length; i++) {
      if (this.cqs[i].name === name) {
        this.cqs.splice(i, 1);

        break;
      }
    }
  };

  return Row;
});

app.factory("Column", function() {
  Column.VERSIONS = 3;

  function Column(name, versions) {
    this.name = name;
    this.values = [];

    var v = versions || Column.VERSIONS;

    for (var i = 0; i < v; i++) {
      this.values.push({
        timestamp: null,
        value: null
      });
    }
  }

  Column.prototype.getName = function() {
    return this.name;
  };

  Column.prototype.setValue = function(value, timestamp) {
    var t = timestamp || Date.now();
    var set = false;

    for (var i = this.values.length - 1; i >= 0; i--) {
      if (this.values[i].timestamp !== null) {
        if (i !== this.values.length - 1) {
          if (this.values[i].timestamp > t) {
            set = true;

            this.values[i + 1].timestamp = t;
            this.values[i + 1].value = value;
          } else {
            this.values[i + 1] = angular.copy(this.values[i]);

            if (i === 0) {
              set = true;

              this.values[0].timestamp = t;
              this.values[0].value = value;
            }
          }
        }
      }
    }

    if (!set) {
      this.values[0].timestamp = t;
      this.values[0].value = value;
    }
  };

  Column.prototype.getValue = function(timestamp) {
    if (timestamp) {
      for (var i = 0; i < this.values.length; i++) {
        if (this.values[i].timestamp === timestamp) {
          return this.values[i].value;
        }
      }

      return null;
    } else {
      return this.values[0].value;
    }
  };

  Column.prototype.getValues = function() {
    return this.values;
  };

  return Column;
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
    this.cqs = {};
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

  Operation.prototype.getTable = function() {
    return this.table;
  };

  Operation.prototype.getKey = function() {
    return this.key;
  };

  Operation.prototype.getCreateCQs = function() {
    return this.cqs.create;
  };

  Operation.prototype.getUpdateCQs = function() {
    return this.cqs.update;
  };

  Operation.prototype.getRows = function() {
    return this.rows;
  };

  Operation.prototype.getCQs = function() {
    return this.cqs;
  };

  Operation.prototype.setSummary = function(summary) {
    this.summary = summary;
  };

  Operation.prototype.setTable = function(table) {
    this.table = table;
  };

  Operation.prototype.setKey = function(key) {
    this.key = key;
  };

  Operation.prototype.createCQ = function(name, value) {
    this.cqs.create = this.cqs.create || [];

    this.cqs.create.push({
      "name": name,
      "value": value
    });
  };

  Operation.prototype.updateCQ = function(name, oldvalue, newvalue) {
    this.cqs.update = this.cqs.update || [];

    this.cqs.update.push({
      "name": name,
      "oldvalue": oldvalue,
      "newvalue": newvalue
    });
  };

  Operation.prototype.createRow = function(key, cqs, values) {
    this.rows = this.rows || [];

    this.cqs = cqs;

    this.rows.push({
      "key": key,
      "values": values
    });
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

app.factory("Sample", function() {
  function Sample() {}

  Sample.SAMPLE1 = {
    "tables": [{
      "name": "Mail",
      "rows": [{
        "key": "12345",
        "cqs": [{
          "name": "messageId",
          "value": "5fc38314-e290-ae5da5fc375d"
        }, {
          "name": "timestamp",
          "value": "1307097848"
        }, {
          "name": "email-message",
          "value": "Hi Lars, ..."
        }]
      }, {
        "key": "12345",
        "cqs": [{
          "name": "messageId",
          "value": "725aae5f-d72e-f90f3f070419"
        }, {
          "name": "timestamp",
          "value": "1307099848"
        }, {
          "name": "email-message",
          "value": "Welcome, and ..."
        }]
      }, {
        "key": "12345",
        "cqs": [{
          "name": "messageId",
          "value": "cc6775b3-f249-c6dd2b1a7467"
        }, {
          "name": "timestamp",
          "value": "1307101848"
        }, {
          "name": "email-message",
          "value": "To Whom It ..."
        }]
      }, {
        "key": "12345",
        "cqs": [{
          "name": "messageId",
          "value": "dcbee495-6d5e-6ed48124632c"
        }, {
          "name": "timestamp",
          "value": "1307103848"
        }, {
          "name": "email-message",
          "value": "Hi, how are ..."
        }]
      }, {
        "key": "67890",
        "cqs": [{
          "name": "messageId",
          "value": "531ee495-6d5e-7e3a81248ef4"
        }, {
          "name": "timestamp",
          "value": "1484696746"
        }, {
          "name": "email-message",
          "value": "Hello World"
        }]
      }]
    }],
    "operations": [{
      "title": "Create 1st mail",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "messageId",
          "value": "5fc38314-e290-ae5da5fc375d"
        }, {
          "name": "timestamp",
          "value": "1307097848"
        }, {
          "name": "email-message",
          "value": "Hi Lars, ..."
        }]
      },
      "summary": "Create 1st mail, using userId treats as rowkey",
      "table": "Mail",
      "key": "12345"
    }, {
      "title": "Create 2nd mail",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "messageId",
          "value": "725aae5f-d72e-f90f3f070419"
        }, {
          "name": "timestamp",
          "value": "1307099848"
        }, {
          "name": "email-message",
          "value": "Welcome, and ..."
        }]
      },
      "table": "Mail",
      "key": "12345"
    }, {
      "title": "Create 3rd mail",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "messageId",
          "value": "cc6775b3-f249-c6dd2b1a7467"
        }, {
          "name": "timestamp",
          "value": "1307101848"
        }, {
          "name": "email-message",
          "value": "To Whom It ..."
        }]
      },
      "table": "Mail",
      "key": "12345"
    }, {
      "title": "Create 4th mail",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "messageId",
          "value": "dcbee495-6d5e-6ed48124632c"
        }, {
          "name": "timestamp",
          "value": "1307103848"
        }, {
          "name": "email-message",
          "value": "Hi, how are ..."
        }]
      },
      "table": "Mail",
      "key": "12345"
    }, {
      "title": "Get all User[12345] mails",
      "type": 2,
      "cqs": ["messageId", "timestamp", "email-message"],
      "summary": "Use Row Key scan all specific userId mails",
      "table": "Mail",
      "rows": [{
        "key": "12345",
        "values": ["5fc38314-e290-ae5da5fc375d", "1307097848", "Hi Lars, ..."]
      }, {
        "key": "12345",
        "values": ["725aae5f-d72e-f90f3f070419", "1307099848", "Welcome, and ..."]
      }, {
        "key": "12345",
        "values": ["cc6775b3-f249-c6dd2b1a7467", "1307101848", "To Whom It ..."]
      }, {
        "key": "12345",
        "values": ["dcbee495-6d5e-6ed48124632c", "1307103848", "Hi, how are ..."]
      }]
    }, {
      "title": "Create 5th mail",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "messageId",
          "value": "531ee495-6d5e-7e3a81248ef4"
        }, {
          "name": "timestamp",
          "value": "1484696746"
        }, {
          "name": "email-message",
          "value": "Hello World"
        }]
      },
      "table": "Mail",
      "key": "67890"
    }, {
      "title": "Get all User[67890] mails",
      "type": 2,
      "cqs": ["messageId", "timestamp", "email-message"],
      "table": "Mail",
      "rows": [{
        "key": "67890",
        "values": ["531ee495-6d5e-7e3a81248ef4", "1484696746", "Hello World"]
      }]
    }]
  };
  Sample.SAMPLE2 = {
    "tables": [{
      "name": "UserTable",
      "rows": [{
        "key": "12345",
        "cqs": [{
          "name": "userId",
          "value": "12345"
        }, {
          "name": "name",
          "value": "kewang"
        }, {
          "name": "slogan",
          "value": "Happ"
        }, {
          "name": "status",
          "value": "1(login)"
        }]
      }]
    }, {
      "name": "LoginTable",
      "rows": [{
        "key": "kewang",
        "cqs": [{
          "name": "password",
          "value": "thisispassword"
        }, {
          "name": "userId",
          "value": "12345"
        }]
      }]
    }, {
      "name": "AccessTable",
      "rows": [{
        "key": "12345",
        "cqs": [{
          "name": "accessToken",
          "value": "thisisaccesstoken"
        }, {
          "name": "expiredTime",
          "value": "1455456395"
        }]
      }]
    }],
    "operations": [{
      "title": "Add new user information",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "userId",
          "value": "12345"
        }, {
          "name": "name",
          "value": "kewang"
        }, {
          "name": "slogan",
          "value": "Happ"
        }]
      },
      "table": "UserTable",
      "key": "12345"
    }, {
      "title": "Add id & password to login list",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "password",
          "value": "thisispassword"
        }, {
          "name": "userId",
          "value": "12345"
        }]
      },
      "table": "LoginTable",
      "key": "kewang"
    }, {
      "title": "Below is Login flow",
      "type": 3,
      "cqs": {}
    }, {
      "title": "Check id & password is correct",
      "type": 2,
      "cqs": ["password", "userId"],
      "summary": "Check row key & password CQ, then get userId",
      "table": "LoginTable",
      "rows": [{
        "key": "kewang",
        "values": ["thisispassword", "12345"]
      }]
    }, {
      "title": "If id & password is correct, update Access Token",
      "type": 0,
      "cqs": {
        "create": [{
          "name": "accessToken",
          "value": "thisisaccesstoken"
        }, {
          "name": "expiredTime",
          "value": "1455456395"
        }]
      },
      "table": "AccessTable",
      "key": "12345"
    }, {
      "title": "Update my login status",
      "type": 1,
      "cqs": {
        "create": [{
          "name": "status",
          "value": "1(login)"
        }]
      },
      "table": "UserTable",
      "key": "12345"
    }, {
      "title": "Return my information",
      "type": 2,
      "cqs": ["userId", "name", "slogan", "status"],
      "table": "UserTable",
      "rows": [{
        "key": "12345",
        "values": ["12345", "kewang", "Happ", "1(login)"]
      }]
    }, {
      "title": "Return access information",
      "type": 2,
      "cqs": ["accessToken", "expiredTime"],
      "table": "AccessTable",
      "rows": [{
        "key": "12345",
        "values": ["thisisaccesstoken", "1455456395"]
      }]
    }, {
      "title": "Below is Get my information flow",
      "type": 3,
      "cqs": {}
    }, {
      "title": "Check userId & accessToken is currect",
      "type": 2,
      "cqs": ["accessToken", "expiredTime"],
      "table": "AccessTable",
      "rows": [{
        "key": "12345",
        "values": ["thisisaccesstoken", "1455456395"]
      }]
    }, {
      "title": "Return my information",
      "type": 2,
      "cqs": ["userId", "name", "slogan", "status"],
      "table": "UserTable",
      "rows": [{
        "key": "12345",
        "values": ["12345", "kewang", "Happ", "1(login)"]
      }]
    }]
  };

  return Sample;
});

app.factory("ImportService", function(Table, Operation) {
  function ImportService() {}

  ImportService.import = function(data) {
    var root = data;
    var tables = [];
    var operations = [];

    if (root.tables) {
      for (var i = 0; i < root.tables.length; i++) {
        var tmpTable = new Table(root.tables[i].name);

        for (var j = 0; j < root.tables[i].rows.length; j++) {
          var row = tmpTable.createRow(root.tables[i].rows[j].key);

          for (var k = 0; k < root.tables[i].rows[j].cqs.length; k++) {
            var name = root.tables[i].rows[j].cqs[k].name;
            var value = root.tables[i].rows[j].cqs[k].value;

            row.createCQ(name, value);
          }
        }

        tmpTable.buildFullTable();

        tables.push(tmpTable);
      }
    }

    if (root.operations) {
      for (var i = 0; i < root.operations.length; i++) {
        var operation = root.operations[i];
        var tmpOperation = new Operation(operation.title, operation.type);

        tmpOperation.setSummary(operation.summary);

        switch (operation.type) {
          case Operation.Type.CREATE:
            tmpOperation.setTable(operation.table);
            tmpOperation.setKey(operation.key);

            if (operation.cqs.create) {
              for (var j = 0; j < operation.cqs.create.length; j++) {
                var name = operation.cqs.create[j].name;
                var value = operation.cqs.create[j].value;

                tmpOperation.createCQ(name, value);
              }
            }

            break;
          case Operation.Type.UPDATE:
            tmpOperation.setTable(operation.table);
            tmpOperation.setKey(operation.key);

            if (operation.cqs.create) {
              for (var j = 0; j < operation.cqs.create.length; j++) {
                var name = operation.cqs.create[j].name;
                var value = operation.cqs.create[j].value;

                tmpOperation.createCQ(name, value);
              }
            }

            if (operation.cqs.update) {
              for (var j = 0; j < operation.cqs.update.length; j++) {
                var name = operation.cqs.update[j].name;
                var oldvalue = operation.cqs.update[j].oldvalue;
                var newvalue = operation.cqs.update[j].newvalue;

                tmpOperation.updateCQ(name, oldvalue, newvalue);
              }
            }

            break;
          case Operation.Type.GET:
            tmpOperation.setTable(operation.table);

            for (var j = 0; j < operation.rows.length; j++) {
              var row = operation.rows[j];

              tmpOperation.createRow(row.key, operation.cqs, row.values);
            }

            break;
          case Operation.Type.OTHER:
            // noop
            break;
        }

        operations.push(tmpOperation);
      }
    }

    return {
      "tables": tables,
      "operations": operations
    };
  };

  return ImportService;
});