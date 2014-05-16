var app = angular.module("hbase-dataflow-app", []);

app.controller("dataflow", function($scope){
  $scope.cqs = [];
  $scope.tableList = [];

  $scope.createTable = function() {
    var name = prompt("Create a new table");
    var t = new Table(name);

    this.tableList.push(t);

    console.log(this.tableList);
  };

  $scope.addCQ = function() {
    $scope.cqs.push({
      name: "aaa",
      value: "asdfasdf"
    });
  };
});
