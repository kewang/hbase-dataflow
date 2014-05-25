var app = angular.module("hbase-dataflow-app", []);

app.controller("dataflow", function($scope){
  $scope.cqs = [];
  $scope.tableList = [];
  $scope.operationList = [];
  $scope.tmp_cqs = [];

  $scope.createTable = function() {
    var name = prompt("Create a new table");
    var t = new Table(name);

    this.tableList.push(t);
  };

  $scope.addCQ = function() {
    this.tmp_cqs.push({});
  };

  $scope.createRowkeyAndCQ = function() {
    // create row key and cq
    this.selectTable2.createRowkey(this.tmp_rk);

    for(var i=0;i<this.tmp_cqs.length;i++){
      this.selectTable2.createCQ(this.tmp_rk, this.tmp_cqs[i].name, this.tmp_cqs[i].value);
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
});