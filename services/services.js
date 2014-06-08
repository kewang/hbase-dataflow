"use strict";

var app = angular.module("hbase-dataflow-app.services", []);

// imitate http://www.bennadel.com/blog/2527-defining-instantiatable-classes-in-the-angularjs-dependency-injection-framework.htm
app.factory("Table", function() {
  var entities = [];

  function Table(name){
    this.name = name;
    this.rowkeys = [];
  }

  Table.prototype.getName = function(){
    return this.name;
  };

  Table.prototype.createRowkey = function(rowkey) {
    this.rowkeys.push({
      "rowkey": rowkey,
      "cqs": []
    });
  };

  Table.prototype.getRowkeys = function(){
    return this.rowkeys;
  };

  Table.prototype.createCQ = function(rowkey, cq, value) {
    var found;

    for(var i=0;i<this.rowkeys.length;i++){
      if(this.rowkeys[i].rowkey === rowkey){
        found = this.rowkeys[i];

        break;
      }
    }

    if(found){
      found.cqs.push({
        "name": cq,
        "value": value
      });
    }
  };

  Table.prototype.buildFullTable = function() {
    var current_rowkeys = [];
    var current_cqs = [];

    for(var i=0;i<this.rowkeys.length;i++){
      for(var j=0;j<this.rowkeys[i].cqs.length;j++){
        var cq = this.rowkeys[i].cqs[j];

        // not found the same CQ
        if(current_cqs.indexOf(cq.name) == -1){
          current_cqs.push(cq.name);
        }
      }
    }

    for(var i=0;i<this.rowkeys.length;i++){
      var cqs = [];

      for(var j=0;j<current_cqs.length;j++){
        var found = false;

        for(var k=0;k<this.rowkeys[i].cqs.length;k++){
          var cq = this.rowkeys[i].cqs[k];

          if(current_cqs[j] === cq.name){
            cqs.push(cq.value);

            found=true;

            break;
          }
        }

        if(!found){
          cqs.push(null);
        }
      }

      current_rowkeys.push({
        "rowkey": this.rowkeys[i].rowkey,
        "cqs": cqs
      });
    }

    this.fullRowkeys = current_rowkeys;
    this.fullCQs = current_cqs;
  };

  Table.prototype.setRowkeys = function(rowkeys) {
    this.rowkeys = rowkeys;
  };

  Table.prototype.getFullRowkeys = function() {
    return this.fullRowkeys;
  };

  Table.prototype.getFullCQs = function() {
    return this.fullCQs;
  };

  Table.prototype.removeByRowkey = function(rowkey){
    for(var i = 0;i<this.rowkeys.length;i++){
      var r = this.rowkeys[i];

      if(r.rowkey === rowkey.rowkey){
        this.rowkeys.splice(i, 1);

        break;
      }
    }
  };

  Table.create = function(table){
    entities.push(table);
  };

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
  };

  return Table;
});

app.factory("Operation", function() {
  Operation.Type = {
    CREATE: 0,
    UPDATE: 1,
    GET: 2,
    SCAN: 3
  };

  var entities = [];

  function Operation(title, type){
    this.title = title;
    this.type = type;
  }

  Operation.prototype.getTitle = function(){
    return this.title;
  };

  Operation.prototype.getType = function(){
    return this.type;
  };

  Operation.create = function(operation){
    entities.push(operation);
  };

  Operation.findAll = function(){
    return entities;
  };

  return Operation;
});
