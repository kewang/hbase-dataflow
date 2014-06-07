var app = angular.module("hbase-dataflow-app", ["hbase-dataflow-app.services", "ui.bootstrap"]);

app.controller("TableCtrl", function($scope, Table){
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
    var exportData = angular.toJson($scope.tableList);
    var blob = new Blob([exportData], {type: MIMETYPE});
    var a = document.createElement("a");

    window.URL = window.webkitURL || window.URL;

    a.download = "export.json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = [MIMETYPE, a.download, a.href].join(":");

    a.click();
  };

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
          $scope.tableList.push(tmpTable);
        });
      }

      $("#import-tables-dialog").modal("hide");
    }

    reader.readAsText(file);
  };
});

app.controller("PutRowCtrl", function($scope, $modal, Table){
  $scope.tables = Table.findAll();

  $scope.showPutRowDialog = function(){
    var modalInstance = $modal.open({
      templateUrl: "/includes/put_row_dialog",
      controller: "PutRowDialogCtrl",
      size: "lg",
      resolve: {
        putTable: function(){
          return $scope.putTable;
        }
      }
    });
  };
});

app.controller("PutRowDialogCtrl", function($scope, $modalInstance, putTable){
  $scope.table = putTable;
  $scope.form = {};
  $scope.form.cqs = [];

  $scope.addCQ = function(){
    $scope.form.cqs.push({});
  };

  $scope.put = function() {
    // create row key and cq
    $scope.table.createRowkey($scope.form.rowKey);

    for(var i=0;i<$scope.form.cqs.length;i++){
      var name = $scope.form.cqs[i].name;
      var value = $scope.form.cqs[i].value;

      $scope.table.createCQ($scope.form.rowKey, name, value);
    }

    // clear form field
    $scope.form.rowKey = "";
    $scope.form.cqs = [];
    $scope.form.operationTitle = "";

    $scope.table.buildFullTable();

    $modalInstance.close();
  };
});

app.controller("CreateRowCtrl", function($scope, Table){
  $scope.tables = Table.findAll();
  $scope.cqs = [];
  $scope.operationList = [];
  $scope.tmp_cqs = [];
  $scope.tmp_operation = {};

  $scope.showCreateQualifiersDialog = function() {
    $scope.addCQ();

    $("#create-qualifiers-dialog").modal("show");
  };

  $scope.addCQ = function() {
    $scope.tmp_cqs.push({});
  };

  $scope.createRowkeyAndCQ = function() {
    // create row key and cq
    $scope.selectTable2.createRowkey($scope.tmp_rk);

    for(var i=0;i<$scope.tmp_cqs.length;i++){
      var name = $scope.tmp_cqs[i].name;
      var value = $scope.tmp_cqs[i].value;

      $scope.selectTable2.createCQ($scope.tmp_rk, name, value);
    }

    // create operation
    var o = new Operation($scope.tmp_operation_title);

    $scope.operationList.push(o);

    $scope.tmp_rk = "";
    $scope.tmp_cqs = [];
    $scope.tmp_operation_title = "";

    $scope.selectTable2.buildFullTable();

    $("#create-qualifiers-dialog").modal("hide");
  };

  $scope.showOperation = function(operation) {
    // retreive operation variable from child scope to parent scope
    $scope.tmp_operation = operation;

    $("#show-operation-dialog").modal("show");
  };
});
