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
    $scope.table = null;
  });

  $scope.$on("stopSearchTable", function(event) {
    $scope.key = null;

    $scope.search = false;
  });

  $scope.get = function(key) {
    $scope.table = angular.copy($scope.originaltable);

    var rows = $scope.table.getRows();

    for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i].getKey() !== key) {
        rows.splice(i, 1);
      }
    }
  };

  $scope.scan = function(options) {
    $scope.table = angular.copy($scope.originaltable);

    var rows = $scope.table.getRows();

    for (var i = rows.length - 1; i >= 0; i--) {
      if (rows[i].key.indexOf(options.key) !== 0) {
        rows.splice(i, 1);
      }
    }
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
          return $scope.table;
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
    var root = {
      tables: angular.copy($scope.tables),
      operations: angular.copy($scope.operations)
    };

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
    var result = ImportService.import(Sample.getSample(index));

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
  $scope.table = table;
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

    operation.setSummary($scope.form.operation.summary)
      .setTableName(table.getName())
      .addRow(angular.copy(row));

    Operation.create(operation);

    delete $scope.form;

    $rootScope.$broadcast("changeTable", table);

    $modalInstance.close();
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("UpdateRowDialogCtrl", function($rootScope, $scope, $modalInstance, table, Operation) {
  $scope.table = table;
  $scope.form = {};

  $scope.changeRow = function() {
    $scope.form.columns = [];

    var families = $scope.form.row.getColumns();

    for (var i = 0; i < families.length; i++) {
      var family = families[i];
      var columns = family.getColumns();

      for (var j = 0; j < columns.length; j++) {
        var column = columns[j];

        $scope.form.columns.push({
          name: family.getName() + ":" + column.getName(),
          value: column.getValue().getValue()
        });
      }
    }
  };

  $scope.addColumn = function() {
    $scope.form.columns.push({
      "add": true
    });
  };

  $scope.update = function() {
    var columns = $scope.form.columns;

    for (var i = 0; i < columns.length; i++) {
      var column = columns[i];

      $scope.form.row.addColumn(column.name, column.value);
    }

    var operation = new Operation($scope.form.operation.title, Operation.Type.UPDATE);

    operation.setSummary($scope.form.operation.summary)
      .setTableName($scope.table.getName())
      .addRow(angular.copy($scope.form.row));

    Operation.create(operation);

    delete $scope.form;

    $rootScope.$broadcast("changeTable", $scope.table);

    $modalInstance.close();
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("GetRowDialogCtrl", function($rootScope, $scope, $modalInstance, table, Operation) {
  $scope.table = table;
  $scope.form = {};

  $scope.get = function() {
    var rows = $scope.table.getRows();
    var operation = new Operation($scope.form.operation.title, Operation.Type.GET);

    operation.setSummary($scope.form.operation.summary)
      .setTableName(table.getName());

    for (var i = 0; i < rows.length; i++) {
      operation.addRow(rows[i]);
    }

    Operation.create(operation);

    // clear form field
    delete $scope.form;

    $rootScope.$broadcast("changeTable", table);

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
    var operation = new Operation($scope.form.operation.title, Operation.Type.OTHER);

    operation.setSummary($scope.form.operation.summary);

    Operation.create(operation);

    // clear form field
    delete $scope.form;

    $modalInstance.close();
  };

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});

app.controller("OperationDialogCtrl", function($scope, $modalInstance, Table, Operation, operation) {
  $scope.operation = operation;
  $scope.table = new Table($scope.operation.getTableName());

  if ($scope.operation.getType() !== Operation.Type.OTHER) {
    var rows = $scope.operation.getRows();

    for (var i = 0; i < rows.length; i++) {
      $scope.table.addRow(rows[i]);
    }
  }

  $scope.close = function() {
    $modalInstance.dismiss();
  };
});