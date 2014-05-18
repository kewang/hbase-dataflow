var app = angular.module("hbase-dataflow-app", []);

app.controller("dataflow", function($scope){
  $scope.cqs = [];
  $scope.tableList = [];
  $scope.tmp_cqs = [];
  $scope.currentTable;

  $scope.createTable = function() {
    var name = prompt("Create a new table");
    var t = new Table(name);

    this.tableList.push(t);
  };

  $scope.addCQ = function() {
    this.tmp_cqs.push({});
  };

  $scope.createRowkeyAndCQ = function() {
    this.selectTable2.createRowkey(this.tmp_rk);

    for(var i=0;i<this.tmp_cqs.length;i++){
      this.selectTable2.createCQ(this.tmp_rk, this.tmp_cqs[i].name, this.tmp_cqs[i].value);
    }

    $("#create-qualifiers-dialog").modal("hide");
  };

  $scope.showTable = function() {
    this.currentTable = this.selectTable1;
  };
});
