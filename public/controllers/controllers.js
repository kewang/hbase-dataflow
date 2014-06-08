var app = angular.module("hbase-dataflow-app", ["hbase-dataflow-app.services", "ui.bootstrap"]);

app.controller("TableCtrl", function($scope, $modal, Table){
  $scope.tables = Table.findAll();

  $scope.createTable = function() {
    var name = prompt("Create a new table");

    if(name){
      var t = new Table(name);

      Table.create(t);
    }else{
      alert("Please input a table name");
    }
  };

  $scope.exportTables = function() {
    var MIMETYPE = "application/json";
    var tmpTables = angular.copy($scope.tables);

    for(var i=0;i<tmpTables.length;i++){
      var table = tmpTables[i];

      delete table.fullRowkeys;
      delete table.fullCQs;
    }

    var exportData = angular.toJson(tmpTables);
    var blob = new Blob([exportData], {type: MIMETYPE});
    var a = document.createElement("a");

    window.URL = window.webkitURL || window.URL;

    a.download = "export.json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = [MIMETYPE, a.download, a.href].join(":");

    a.click();
  };

  $scope.showImportTablesDialog = function(){
    var modalInstance = $modal.open({
      templateUrl: "/includes/import_tables_dialog",
      controller: "ImportTablesDialogCtrl",
      size: "lg"
    });
  };
});

app.controller("ImportTablesDialogCtrl", function($scope, $modalInstance, Table){
  $scope.tables = Table.findAll();

  $scope.importTables = function() {
    var file = $("#fileChoose")[0].files[0];
    var reader = new FileReader();

    reader.onloadend = function(e) {
      var data = JSON.parse(e.target.result);

      for(var i=0;i<data.length;i++){
        var tmpTable = new Table(data[i].name);

        tmpTable.setRowkeys(data[i].rowkeys);

        tmpTable.buildFullTable();

        $scope.$apply(function(){
          $scope.tables.push(tmpTable);
        });
      }

      $modalInstance.close();
    }

    reader.readAsText(file);
  };
});

app.controller("CreateRowCtrl", function($scope, $modal, Table){
  $scope.tables = Table.findAll();

  $scope.showCreateRowDialog = function(){
    var modalInstance = $modal.open({
      templateUrl: "/includes/create_row_dialog",
      controller: "CreateRowDialogCtrl",
      size: "lg",
      resolve: {
        createTable: function(){
          return $scope.createTable;
        }
      }
    });
  };
});

app.controller("CreateRowDialogCtrl", function($scope, $modalInstance, createTable, Operation){
  $scope.table = createTable;
  $scope.form = {};
  $scope.form.cqs = [];

  $scope.addCQ = function(){
    $scope.form.cqs.push({});
  };

  $scope.create = function() {
    // create row key and cq
    $scope.table.createRowkey($scope.form.rowKey);

    for(var i=0;i<$scope.form.cqs.length;i++){
      var name = $scope.form.cqs[i].name;
      var value = $scope.form.cqs[i].value;

      $scope.table.createCQ($scope.form.rowKey, name, value);
    }

    var o = new Operation($scope.form.operationTitle);

    Operation.create(o);

    // clear form field
    $scope.form.rowKey = "";
    $scope.form.cqs = [];
    $scope.form.operationTitle = "";

    $scope.table.buildFullTable();

    $modalInstance.close();
  };
});

app.controller("UpdateRowCtrl", function($scope, $modal, Table){
  $scope.tables = Table.findAll();

  $scope.showUpdateRowDialog = function(){
    var modalInstance = $modal.open({
      templateUrl: "/includes/update_row_dialog",
      controller: "UpdateRowDialogCtrl",
      size: "lg",
      resolve: {
        updateTable: function(){
          return $scope.updateTable;
        }
      }
    });
  };
});

app.controller("UpdateRowDialogCtrl", function($scope, $modalInstance, updateTable){
  $scope.table = updateTable;
  $scope.form = {};

  $scope.addCQ = function(){
    $scope.form.row.cqs.push({});
  };
});

app.controller("OperationCtrl", function($scope, $modal, Operation){
  $scope.operations = Operation.findAll();

  $scope.showOperationDialog = function(operation){
    var modalInstance = $modal.open({
      templateUrl: "/includes/operation_dialog",
      controller: "OperationDialogCtrl",
      size: "lg",
      resolve: {
        operation: function(){
          return operation;
        }
      }
    });
  };
});

app.controller("OperationDialogCtrl", function($scope, $modalInstance, operation){
  $scope.operation = operation;
});
