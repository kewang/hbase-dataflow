var app = angular.module("hbase-dataflow-app", []);

app.controller("dataflow", function($scope){
  $scope.cqs = [];
  $scope.tableList = [];
  $scope.operationList = [];
  $scope.tmp_cqs = [];
  $scope.tmp_operation = {};

  $scope.createTable = function() {
    var name = prompt("Create a new table");

    if(name){
      var t = new Table(name);

      this.tableList.push(t);
    }else{
      alert("Please input a table name");
    }
  };

  $scope.addCQ = function() {
    this.tmp_cqs.push({});
  };

  $scope.createRowkeyAndCQ = function() {
    if(!this.tmp_operation_title){
      alert("Please input a operation title");

      return;
    }

    if(!this.tmp_rk){
      alert("Please input a row key");

      return;
    }

    if(this.tmp_cqs.length === 0){
      alert("Please add a column qualifier");

      return;
    }

    // create row key and cq
    this.selectTable2.createRowkey(this.tmp_rk);

    for(var i=0;i<this.tmp_cqs.length;i++){
      var name = this.tmp_cqs[i].name;
      var value = this.tmp_cqs[i].value;

      if(name && value){
        this.selectTable2.createCQ(this.tmp_rk, name, value);
      }
    }

    // create operation
    var o = new Operation(this.tmp_operation_title);

    this.operationList.push(o);

    this.tmp_rk = "";
    this.tmp_cqs = [];
    this.tmp_operation_title = "";

    this.selectTable2.buildFullTable();

    $("#create-qualifiers-dialog").modal("hide");
  };

  $scope.showOperation = function(operation) {
    // retreive operation variable from child scope to parent scope
    this.$parent.tmp_operation = operation;

    $("#show-operation-dialog").modal("show");
  };

  $scope.exportTables = function() {
    var MIMETYPE = "application/json";
    var exportData = angular.toJson(this.tableList);
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

    (function(that){
      reader.onloadend = function(e) {
        var data = JSON.parse(e.target.result);

        for(var i=0;i<data.length;i++){
          var tmpTable = new Table(data[i].name);

          tmpTable.setRowkeys(data[i].rowkeys);

          tmpTable.buildFullTable();

          $scope.$apply(function(){
            that.tableList.push(tmpTable);
          });
        }

        $("#import-tables-dialog").modal("hide");
      }

      reader.readAsText(file);
    })(this);
  };
});
