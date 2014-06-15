"use strict";

var app = angular.module("hbase-dataflow-app", ["hbase-dataflow-app.services", "ui.bootstrap"]);

app.controller("TableCtrl", function($rootScope, $scope, Table){
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

  $scope.changeTable = function(table){
    $rootScope.$broadcast("changeTable", table);
  };
});

app.controller("TableDetailCtrl", function($scope){
  $scope.$on("changeTable", function(event, table){
    $scope.table = table;
  });
});

app.controller("RowCtrl", function($scope, $modal, Table, Operation){
  $scope.tables = Table.findAll();
  $scope.operations = Operation.findAll();

  $scope.showRowCtrlDialog = function(){
    switch($scope.rowCommand){
    case "create":
      $modal.open({
        templateUrl: "includes/create_row_dialog",
        controller: "CreateRowDialogCtrl",
        size: "lg",
        windowClass: "dialog",
        resolve: {
          table: function(){
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
          table: function(){
            return $scope.table;
          }
        }
      });

      break;
    }
  };

  $scope.exportData = function() {
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

  $scope.showImportDataDialog = function(){
    $modal.open({
      templateUrl: "includes/import_data_dialog",
      controller: "ImportDataDialogCtrl",
      size: "lg",
      windowClass: "dialog"
    });
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
    var row = $scope.table.createRow($scope.form.key);
    var o = new Operation($scope.form.operationTitle, Operation.Type.CREATE);

    o.setSummary($scope.form.operationSummary);
    o.setTable($scope.table.getName());
    o.setKey($scope.form.key);

    for(var i=0;i<$scope.form.cqs.length;i++){
      var name = $scope.form.cqs[i].name;
      var value = $scope.form.cqs[i].value;

      row.createCQ(name, value);

      o.createCQ(name, value);
    }

    Operation.create(o);

    // clear form field
    delete $scope.form;

    $scope.table.buildFullTable();

    $modalInstance.close();
  };
});

app.controller("UpdateRowDialogCtrl", function($scope, $modalInstance, table, Operation){
  $scope.table = table;
  $scope.form = {};

  $scope.changeRow = function(){
    $scope.form.tmprow = angular.copy($scope.form.row);
  };

  $scope.addCQ = function(){
    $scope.form.tmprow.cqs.push({
      "add": true
    });
  };

  $scope.update = function() {
    var o = new Operation($scope.form.operationTitle, Operation.Type.UPDATE);

    o.setSummary($scope.form.operationSummary);
    o.setKey($scope.form.tmprow.getKey());

    for(var i=0;i<$scope.form.tmprow.cqs.length;i++){
      var newCQ = $scope.form.tmprow.cqs[i];
      var found = false;

      for(var j=0;j<$scope.form.row.cqs.length;j++){
        var oldCQ = $scope.form.row.cqs[j];

        if(newCQ.name === oldCQ.name){
          found = true;

          // update CQ
          if(newCQ.value !== oldCQ.value){
            o.updateCQ(newCQ.name, oldCQ.value, newCQ.value);

            $scope.form.row.updateCQ(newCQ.name, newCQ.value);
          }

          break;
        }
      }

      // create CQ
      if(!found){
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
});

app.controller("ImportDataDialogCtrl", function($scope, $modalInstance, Table, Operation){
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

app.controller("OperationCtrl", function($scope, $modal, Operation){
  $scope.operations = Operation.findAll();

  $scope.showOperationDialog = function(operation){
    $modal.open({
      templateUrl: "includes/operation_dialog",
      controller: "OperationDialogCtrl",
      size: "lg",
      windowClass: "dialog",
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
