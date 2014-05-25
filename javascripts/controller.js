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
    var jsonHeader = "data:attachment/json;charset=utf-8,";
    var exportData = angular.toJson(this.tableList);
    var encodedUri = encodeURI(jsonHeader+exportData);

    window.open(encodedUri);

    // new method refs http://html5-demos.appspot.com/static/a.download.html
    //
    // TODO
  };

  $scope.importTables = function() {
    this.tmp_import_data = JSON.parse(this.tmp_import_data);

    for(var i=0;i<this.tmp_import_data.length;i++){
      var tmpTable = new Table(this.tmp_import_data[i].name);

      tmpTable.setRowkeys(this.tmp_import_data[i].rowkeys);

      tmpTable.buildFullTable();

      this.tableList.push(tmpTable);
    }

    this.tmp_import_data = "";

    $("#import-tables-dialog").modal("hide");
  };
});
