var app = angular.module("hbase-dataflow-app", []);

app.factory("Table", function() {
  var tables = {};
  var entities = [];

  tables.create = function(table){
    entities.push(table);
  }

  tables.findAll = function(){
    return entities;
  };

  tables.findByName = function(name){
    var found;

    for(entity in entities){
      if(entity.name === name){
        found = entity;

        break;
      }
    }

    return found;
  }

  return tables;
});
