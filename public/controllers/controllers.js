"use strict";

var app = angular.module("hbase-dataflow-app", ["hbase-dataflow-app.services", "ui.bootstrap"]);

app.controller("TableCtrl", function($scope, $modal, Table, Operation){
  $scope.tables = Table.findAll();
  $scope.operations = Operation.findAll();

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

    var root = {};

    root.tables = tmpTables;
    root.operations = angular.copy($scope.operations);

    var blob = new Blob([JSON.stringify(root)], {type: MIMETYPE});
    var a = document.createElement("a");

    window.URL = window.webkitURL || window.URL;

    a.download = "export.json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = [MIMETYPE, a.download, a.href].join(":");

    a.click();
  };

  $scope.showImportTablesDialog = function(){
    var modalInstance = $modal.open({
      templateUrl: "includes/import_tables_dialog",
      controller: "ImportTablesDialogCtrl",
      size: "lg"
    });
  };
});

app.controller("ImportTablesDialogCtrl", function($scope, $modalInstance, Table, Operation){
  $scope.tables = Table.findAll();
  $scope.operations = Operation.findAll();

  $scope.importTables = function() {
    var file = $("#fileChoose")[0].files[0];
    var reader = new FileReader();

    reader.onloadend = function(e) {
      var root = JSON.parse(e.target.result);

      if(root.tables){
        for(var i=0;i<root.tables.length;i++){
          var tmpTable = new Table(root.tables[i].name);

          tmpTable.setRowkeys(root.tables[i].rowkeys);
          tmpTable.buildFullTable();

          $scope.$apply(function(){
            $scope.tables.push(tmpTable);
          });
        }
      }

      if(root.operations){
        for(var i=0;i<root.operations.length;i++){
          var tmpOperation = new Operation(root.operations[i].title, root.operations[i].type);

          $scope.$apply(function(){
            $scope.operations.push(tmpOperation);
          });
        }
      }

      $modalInstance.close();
    }

    reader.readAsText(file);
  };
});

app.controller("RowCtrl", function($scope, $modal, Table){
  $scope.tables = Table.findAll();

  $scope.showRowCtrlDialog = function(){
    switch($scope.rowCommand){
    case "create":
      var modalInstance = $modal.open({
        templateUrl: "includes/create_row_dialog",
        controller: "CreateRowDialogCtrl",
        size: "lg",
        resolve: {
          table: function(){
            return $scope.table;
          }
        }
      });

      break;
    case "update":
      var modalInstance = $modal.open({
        templateUrl: "includes/update_row_dialog",
        controller: "UpdateRowDialogCtrl",
        size: "lg",
        resolve: {
          table: function(){
            return $scope.table;
          }
        }
      });

      break;
    }
  };
});

app.controller("CreateRowDialogCtrl", function($scope, $modalInstance, table, Operation){
  $scope.table = table;
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

    var o = new Operation($scope.form.operationTitle, Operation.Type.CREATE);

    Operation.create(o);

    // clear form field
    $scope.form.rowKey = "";
    $scope.form.cqs = [];
    $scope.form.operationTitle = "";

    $scope.table.buildFullTable();

    $modalInstance.close();
  };
});

app.controller("UpdateRowDialogCtrl", function($scope, $modalInstance, table, Operation){
  $scope.table = table;
  $scope.form = {};

  $scope.addCQ = function(){
    $scope.form.rowKey.cqs.push({});
  };

  $scope.update = function() {
    $scope.table.removeByRowkey($scope.form.rowKey);

    // create row key and cq
    $scope.table.createRowkey($scope.form.rowKey.rowkey);

    for(var i=0;i<$scope.form.rowKey.cqs.length;i++){
      var name = $scope.form.rowKey.cqs[i].name;
      var value = $scope.form.rowKey.cqs[i].value;

      $scope.table.createCQ($scope.form.rowKey.rowkey, name, value);
    }

    var o = new Operation($scope.form.operationTitle, Operation.Type.UPDATE);

    Operation.create(o);

    // clear form field
    $scope.form.rowKey = {};
    $scope.form.operationTitle = "";

    $scope.table.buildFullTable();

    $modalInstance.close();
  };
});

app.controller("OperationCtrl", function($scope, $modal, Operation){
  $scope.operations = Operation.findAll();

  $scope.showOperationDialog = function(operation){
    var modalInstance = $modal.open({
      templateUrl: "includes/operation_dialog",
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
