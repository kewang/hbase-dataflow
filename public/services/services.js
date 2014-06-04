var app = angular.module("hbase-dataflow-app", []);

app.factory("Table", function() {
  var tables;

  tables.create = return function(table){
    this.tables.push(table);
  }

  tables.findAll = return function(){
    return tables;
  };

  return tables;
});
