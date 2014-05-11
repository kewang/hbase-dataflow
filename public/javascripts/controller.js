function dataflow($scope){
  $scope.tableList = [];

  $scope.createTable = function(){
    var name = prompt("Create a new table");
    var table = new Table(name);

    console.log(table);
  }
}
