"use strict";

var app = angular.module("hbase-dataflow-app", ["hbase-dataflow-app.services", "ui.bootstrap"]);

app.controller("TableCtrl", function($rootScope, $scope, Table) {
  $scope.tables = Table.findAll();

  $scope.createTable = function() {
    var name = prompt("Create a new table");

    if (name) {
      var t = new Table(name);

      Table.create(t);
    } else {
      alert("Please input a table name");
    }
  };

  $scope.changeTable = function(table) {
    $rootScope.$broadcast("stopSearchTable");
    $rootScope.$broadcast("changeTable", table);
  };

  $scope.$on("clearAllData", function(event) {
    $scope.tables = Table.findAll();
  });
});

app.controller("TableDetailCtrl", function($rootScope, $scope) {
  $scope.search = false;

  $scope.$on("changeTable", function(event, table) {
    $scope.table = table;
  });

  $scope.$on("stopSearchTable", function(event) {
    $scope.search = false;
  });

  $scope.get = function() {
    $rootScope.$broadcast("startSearchTable", $scope.table, {
      "mode": "get",
      "key": $scope.key
    });

    $scope.key = null;

    $scope.search = true;
  };

  $scope.scan = function() {
    $rootScope.$broadcast("startSearchTable", $scope.table, {
      "mode": "scan",
      "key": $scope.key
    });

    $scope.key = null;

    $scope.search = true;
  };

  $scope.$on("clearAllData", function(event) {
    $scope.table = null;
  });
});

app.controller("TableSearchCtrl", function($rootScope, $scope, $modal) {
  $scope.search = false;

  $scope.$on("startSearchTable", function(event, table, options) {
    $scope.originaltable = table;

    $scope.key = options.key;

    if (options.mode === "get") {
      $scope.get(options.key);
    } else if (options.mode === "scan") {
      $scope.scan(options);
    }

    $scope.search = true;
  });

  $scope.$on("clearAllData", function(event) {
    $scope.searchtable = null;
  });

  $scope.$on("stopSearchTable", function(event) {
    $scope.key = null;

    $scope.search = false;
  });

  $scope.get = function(key) {
    $scope.searchtable = angular.copy($scope.originaltable);

    var rows = $scope.searchtable.getRows();

    for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i].key !== key) {
        rows.splice(i, 1);
      }
    }

    $scope.searchtable.buildFullTable();
  };

  $scope.scan = function(options) {
    $scope.searchtable = angular.copy($scope.originaltable);

    var rows = $scope.searchtable.getRows();

    for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i].key.indexOf(options.key) !== 0) {
        rows.splice(i, 1);
      }
    }

    $scope.searchtable.buildFullTable();
  };

  $scope.clear = function() {
    $rootScope.$broadcast("stopSearchTable");

    $scope.key = null;

    $scope.search = false;
  };

  $scope.addToOperation = function() {
    $modal.open({
      templateUrl: "includes/get_row_dialog",
      controller: "GetRowDialogCtrl",
      size: "lg",
      windowClass: "dialog",
      resolve: {
        table: function() {
          return $scope.searchtable;
        }
      }
    });
  };
});

app.controller("RowCtrl", function($scope, $modal, Table) {
  $scope.tables = Table.findAll();

  $scope.$on("changeTable", function(event, table) {
    $scope.table = table;
  });

  $scope.showRowCtrlDialog = function() {
    switch ($scope.rowCommand) {
      case "create":
        $modal.open({
          templateUrl: "includes/create_row_dialog",
          controller: "CreateRowDialogCtrl",
          size: "lg",
          windowClass: "dialog",
          resolve: {
            table: function() {
              return $scope.table;
            }
          }
        });

        break;
      case "update":
        $modal.open({
          templateUrl: "includes/update_row_dialog",
          controller: "UpdateRowDialogCtrl",
          size: "lg",
          windowClass: "dialog",
          resolve: {
            table: function() {
              return $scope.table;
            }
          }
        });

        break;
    }
  };

  $scope.$on("clearAllData", function(event) {
    $scope.tables = Table.findAll();
  });
});

app.controller("SystemCtrl", function($rootScope, $scope, $modal, Table, Operation, Sample, ImportService) {
  $scope.tables = Table.findAll();
  $scope.operations = Operation.findAll();

  $scope.clear = function() {
    Table.clear();
    Operation.clear();

    $scope.tables = Table.findAll();
    $scope.operations = Operation.findAll();

    $rootScope.$broadcast("clearAllData");
  };

  $scope.exportData = function() {
    var MIMETYPE = "application/json";
    var tmpTables = angular.copy($scope.tables);

    for (var i = 0; i < tmpTables.length; i++) {
      var table = tmpTables[i];

      delete table.fullRowkeys;
      delete table.fullCQs;
    }

    var root = {};

    root.tables = tmpTables;
    root.operations = angular.copy($scope.operations);

    var blob = new Blob([JSON.stringify(root)], {
      type: MIMETYPE
    });
    var a = document.createElement("a");

    window.URL = window.webkitURL || window.URL;

    a.download = "export.json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = [MIMETYPE, a.download, a.href].join(":");

    a.click();
  };

  $scope.showImportDataDialog = function() {
    $modal.open({
      templateUrl: "includes/import_data_dialog",
      controller: "ImportDataDialogCtrl",
      size: "lg",
      windowClass: "dialog"
    });
  };

  $scope.importSample = function(index) {
    var result;

    switch (index) {
      case 1:
        result = ImportService.import(Sample.SAMPLE1);

        break;
      case 2:
        result = ImportService.import(Sample.SAMPLE2);

        break;
    }

    $scope.clear();

    for (var i = 0; i < result.tables.length; i++) {
      $scope.tables.push(result.tables[i]);
    }

    for (var i = 0; i < result.operations.length; i++) {
      $scope.operations.push(result.operations[i]);
    }
  };
});

app.controller("CreateRowDialogCtrl", function($rootScope, $scope, $modalInstance, table, Row, Operation) {
  $scope.form = {};
  $scope.form.columns = [];

  $scope.addColumn = function() {
    $scope.form.columns.push({});
  };

  $scope.create = function() {
    var row = new Row($scope.form.key);

    for (var i = 0; i < $scope.form.columns.length; i++) {
      var column = $scope.form.columns[i];

      row.addColumn(column.name, column.value);
    }

    table.addRow(row);

    var operation = new Operation($scope.form.operation.title, Operation.Type.CREATE);

    operation.setSummary($scope.form.operation.summary);
    operation.setTable(table.getName());
    operation.setKey($scope.form.key);

    Operation.create(operation);

    delete $scope.form;

    $rootScope.$broadcast("changeTable", table);

    $modalInstance.close();
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("UpdateRowDialogCtrl", function($scope, $modalInstance, table, Operation) {
  $scope.table = table;
  $scope.form = {};

  $scope.changeRow = function() {
    $scope.form.tmprow = angular.copy($scope.form.row);
  };

  $scope.addCQ = function() {
    $scope.form.tmprow.cqs.push({
      "add": true
    });
  };

  $scope.update = function() {
    var o = new Operation($scope.form.operationTitle, Operation.Type.UPDATE);

    o.setSummary($scope.form.operationSummary);
    o.setTable($scope.table.getName());
    o.setKey($scope.form.tmprow.getKey());

    for (var i = 0; i < $scope.form.tmprow.cqs.length; i++) {
      var newCQ = $scope.form.tmprow.cqs[i];
      var found = false;

      for (var j = 0; j < $scope.form.row.cqs.length; j++) {
        var oldCQ = $scope.form.row.cqs[j];

        if (newCQ.name === oldCQ.name) {
          found = true;

          // update CQ
          if (newCQ.value !== oldCQ.value) {
            o.updateCQ(newCQ.name, oldCQ.value, newCQ.value);

            $scope.form.row.updateCQ(newCQ.name, newCQ.value);
          }

          break;
        }
      }

      // create CQ
      if (!found) {
        o.createCQ(newCQ.name, newCQ.value);

        $scope.form.row.createCQ(newCQ.name, newCQ.value);
      }
    }

    // clear form field
    delete $scope.form;

    Operation.create(o);

    $scope.table.buildFullTable();

    $modalInstance.close();
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("GetRowDialogCtrl", function($scope, $modalInstance, table, Operation) {
  $scope.table = table;
  $scope.form = {};

  $scope.get = function() {
    var o = new Operation($scope.form.operationTitle, Operation.Type.GET);

    o.setSummary($scope.form.operationSummary);
    o.setTable($scope.table.getName());

    var fullKeys = angular.copy($scope.table.getFullKeys());
    var fullCQs = angular.copy($scope.table.getFullCQs());

    for (var i = 0; i < fullKeys.length; i++) {
      var fullKey = fullKeys[i];

      o.createRow(fullKey.key, fullCQs, fullKey.cqs);
    }

    // clear form field
    delete $scope.form;

    Operation.create(o);

    $modalInstance.close();
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("ImportDataDialogCtrl", function($scope, $modalInstance, Table, Operation, ImportService) {
  $scope.tables = Table.findAll();
  $scope.operations = Operation.findAll();

  $scope.importTables = function() {
    var file = $("#fileChoose")[0].files[0];
    var reader = new FileReader();

    reader.onloadend = function(e) {
      var data = JSON.parse(e.target.result);
      var result = ImportService.import(data);

      for (var i = 0; i < result.tables.length; i++) {
        $scope.tables.push(result.tables[i]);
      }

      for (var i = 0; i < result.operations.length; i++) {
        $scope.operations.push(result.operations[i]);
      }

      $modalInstance.close();
    }

    reader.readAsText(file);
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("OperationCtrl", function($scope, $modal, Operation) {
  $scope.operations = Operation.findAll();

  $scope.$on("clearAllData", function(event) {
    $scope.operations = Operation.findAll();
  });

  $scope.createOtherOperation = function() {
    $modal.open({
      templateUrl: "includes/other_dialog",
      controller: "OtherDialogCtrl",
      size: "lg",
      windowClass: "dialog"
    });
  };

  $scope.showOperationDialog = function(operation) {
    $modal.open({
      templateUrl: "includes/operation_dialog",
      controller: "OperationDialogCtrl",
      size: "lg",
      windowClass: "dialog",
      resolve: {
        operation: function() {
          return operation;
        }
      }
    });
  };
});

app.controller("OtherDialogCtrl", function($scope, $modalInstance, Operation) {
  $scope.form = {};

  $scope.other = function() {
    var o = new Operation($scope.form.operationTitle, Operation.Type.OTHER);

    o.setSummary($scope.form.operationSummary);

    Operation.create(o);

    $modalInstance.close();
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("OperationDialogCtrl", function($scope, $modalInstance, operation) {
  $scope.operation = operation;

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});