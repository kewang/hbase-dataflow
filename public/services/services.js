var app = angular.module("hbase-dataflow-app", []);

app.factory("Table", function() {
  var entities = [];

  function Table(name){
    this.name = name;
  }

  Table.prototype.getName = function(){
    return this.name;
  };

  Table.create = function(table){
    entities.push(table);
  }

  Table.findAll = function(){
    return entities;
  };

  Table.findByName = function(name){
    var found;

    for(entity in entities){
      if(entity.name === name){
        found = entity;

        break;
      }
    }

    return found;
  }

  return Table;
});
