var app = angular.module("hbase-dataflow-app", ["ngGrid"]);

app.controller("dataflow", function($scope){
  $scope.myData = [
    {name: "Moroni", age: 50},
    {name: "Tiancum", age: 43},
    {name: "Jacob", age: 27},
    {name: "Nephi", age: 29},
    {name: "Enos", age: 34}
  ];

  $scope.gridOptions = { data: 'myData' };

  $scope.tableList = [];

  $scope.createTable = function(){
    var name = prompt("Create a new table");
    var table = new Table(name);

    this.tableList.push(table);

    console.log(this.tableList);
  }
});
