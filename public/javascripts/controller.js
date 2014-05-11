function dataflow($scope){
  $scope.tableList = [];

  $scope.createTable = function(){
    name = prompt("Create a new table");

    this.tableList.push({
      "name": name
    });
  }

  $scope.changeTable = function(){
  
  }
}
