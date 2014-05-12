var app = angular.module("hbase-dataflow-app", ["ngTable"]);

app.controller("dataflow", function($scope, ngTableParams){
  $scope.data = [
    {name: "Moroni", age: 50},
    {name: "Nephi", age: 29},
    {name: "Enos", age: 34}
  ];

  $scope.cqs = [];

  $scope.tableParams = new ngTableParams({
    page: 1,
    count: 10
  }, {
    total: $scope.data.length,
    getData: function($defer, params){
      $defer.resolve($scope.data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
    }
  });

  $scope.cqParams = new ngTableParams({
    page: 1,
    count: 10
  }, {
    total: $scope.cqs.length,
    getData: function($defer, params){
      $defer.resolve($scope.cqs.slice((params.page() - 1) * params.count(), params.page() * params.count()));
    }
  });

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
