var app = angular.module("hbase-dataflow-app", []);

app.controller("dataflow", function($scope){
  $scope.data = [
    {name: "Moroni", age: 50},
    {name: "Nephi", age: 29},
    {name: "Enos", age: 34}
  ];

  $scope.cqs = [];
  $scope.tableList = [];

  $scope.createTable = function() {
    var name = prompt("Create a new table");
    var table = new Table(name);

    this.tableList.push(table);

    console.log(this.tableList);
  };

  $scope.addCQ = function() {
    $scope.cqs.push({
      name: "aaa",
      value: "asdfasdf"
    });
  };
});
