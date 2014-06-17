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

app.controller("TableDetailCtrl", function($rootScope, $scope){
  $scope.search = false;

  $scope.$on("changeTable", function(event, table){
    $scope.table = table;
  });

  $scope.$on("stopSearchTable", function(event){
    $scope.search = false;
  });

  $scope.get = function(){
    $rootScope.$broadcast("startSearchTable", $scope.table, {
      "mode": "get",
      "key": $scope.key
    });

    $scope.key = null;

    $scope.search = true;
  };

  $scope.scan = function(){
    $rootScope.$broadcast("startSearchTable", $scope.table, {
      "mode": "scan",
      "key": $scope.key
    });

    $scope.key = null;

    $scope.search = true;
  };
});

app.controller("TableSearchCtrl", function($rootScope, $scope, $modal){
  $scope.search = false;

  $scope.$on("startSearchTable", function(event, table, options){
    $scope.originaltable = table;

    $scope.key = options.key;

    if(options.mode === "get"){
      $scope.get(options.key);
    }else if(options.mode === "scan"){
      $scope.scan(options);
    }

    $scope.search = true;
  });

  $scope.get = function(key){
    $scope.searchtable = angular.copy($scope.originaltable);

    var rows = $scope.searchtable.getRows();

    for(var i=rows.length-1;i>=0;i--){
      if(rows[i].key !== key){
        rows.splice(i, 1);
      }
    }

    $scope.searchtable.buildFullTable();
  };

  $scope.scan = function(options){
    $scope.searchtable = angular.copy($scope.originaltable);

    var rows = $scope.searchtable.getRows();

    for(var i=rows.length-1;i>=0;i--){
      if(rows[i].key.indexOf(options.key) !== 0){
        rows.splice(i, 1);
      }
    }

    $scope.searchtable.buildFullTable();
  };

  $scope.clear = function(){
    $rootScope.$broadcast("stopSearchTable");

    $scope.key = null;

    $scope.search = false;
  };

  $scope.addToOperation = function(){
    $modal.open({
      templateUrl: "includes/get_row_dialog",
      controller: "GetRowDialogCtrl",
      size: "lg",
      windowClass: "dialog",
      resolve: {
        table: function(){
          return $scope.searchtable;
        }
      }
    });
  };
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
    o.setTable($scope.table.getName());
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

app.controller("GetRowDialogCtrl", function($scope, $modalInstance, table, Operation){
  $scope.table = table;
  $scope.form = {};

  $scope.get = function() {
    var o = new Operation($scope.form.operationTitle, Operation.Type.GET);

    o.setSummary($scope.form.operationSummary);
    o.setTable($scope.table.getName());

    var fullKeys = angular.copy($scope.table.getFullKeys());
    var fullCQs = angular.copy($scope.table.getFullCQs());

    for(var i=0;i<fullKeys.length;i++){
      var fullKey = fullKeys[i];

      o.createRow(fullKey.key, fullCQs, fullKey.cqs);
    }

    // clear form field
    delete $scope.form;

    Operation.create(o);

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

          for(var j=0;j<root.tables[i].rows.length;j++){
            var row = tmpTable.createRow(root.tables[i].rows[j].key);

            for(var k=0;k<root.tables[i].rows[j].cqs.length;k++){
              var name = root.tables[i].rows[j].cqs[k].name;
              var value = root.tables[i].rows[j].cqs[k].value;

              row.createCQ(name, value);
            }
          }

          tmpTable.buildFullTable();

          $scope.$apply(function(){
            $scope.tables.push(tmpTable);
          });
        }
      }

      if(root.operations){
        for(var i=0;i<root.operations.length;i++){
          var operation = root.operations[i];
          var tmpOperation = new Operation(operation.title, operation.type);

          tmpOperation.setSummary(operation.summary);
          tmpOperation.setTable(operation.table);

          switch(operation.type){
          case Operation.Type.CREATE:
            tmpOperation.setKey(operation.key);

            if(operation.cqs.create){
              for(var j=0;j<operation.cqs.create.length;j++){
                var name = operation.cqs.create[j].name;
                var value = operation.cqs.create[j].value;

                tmpOperation.createCQ(name, value);
              }
            }

            break;
          case Operation.Type.UPDATE:
            tmpOperation.setKey(operation.key);

            if(operation.cqs.create){
              for(var j=0;j<operation.cqs.create.length;j++){
                var name = operation.cqs.create[j].name;
                var value = operation.cqs.create[j].value;

                tmpOperation.createCQ(name, value);
              }
            }

            if(operation.cqs.update){
              for(var j=0;j<operation.cqs.update.length;j++){
                var name = operation.cqs.update[j].name;
                var oldvalue = operation.cqs.update[j].oldvalue;
                var newvalue = operation.cqs.update[j].newvalue;

                tmpOperation.updateCQ(name, oldvalue, newvalue);
              }
            }

            break;
          case Operation.Type.GET:
            for(var j=0;j<operation.rows.length;j++){
              var row = operation.rows[j];

              tmpOperation.createRow(row.key, operation.cqs, row.values);
            }

            break;
          }

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
