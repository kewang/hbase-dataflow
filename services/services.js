"use strict";

var app = angular.module("hbase-dataflow-app.services", []);

// imitate http://www.bennadel.com/blog/2527-defining-instantiatable-classes-in-the-angularjs-dependency-injection-framework.htm
app.factory("Table", function(Row) {
  var entities = [];

  function Table(name){
    this.name = name;
    this.rows = [];
  }

  Table.prototype.getName = function(){
    return this.name;
  };

  Table.prototype.createRow = function(key) {
    var row = new Row(key);

    this.rows.push(row);

    return row;
  };

  Table.prototype.getRows = function(){
    return this.rows;
  };

  Table.prototype.buildFullTable = function() {
    var all_cqs = [];
    var all_rows = [];

    for(var i=0;i<this.rows.length;i++){
      var cqs = this.rows[i].cqs;

      for(var j=0;j<cqs.length;j++){
        var cq = cqs[j];

        // not found the same CQ
        if(all_cqs.indexOf(cq.name) === -1){
          all_cqs.push(cq.name);
        }
      }
    }

    for(var i=0;i<this.rows.length;i++){
      var tmp_cqs = [];
      var row = this.rows[i];

      for(var j=0;j<all_cqs.length;j++){
        var found = false;
        var cqs = row.cqs;

        for(var k=0;k<cqs.length;k++){
          var cq = cqs[k];

          if(all_cqs[j] === cq.name){
            tmp_cqs.push(cq.value);

            found = true;

            break;
          }
        }

        if(!found){
          tmp_cqs.push(null);
        }
      }

      all_rows.push({
        "key": row.key,
        "cqs": tmp_cqs
      });
    }

    this.fullRowkeys = all_rows;
    this.fullCQs = all_cqs;
  };

  Table.prototype.setRows = function(rows) {
    this.rows = rows;
  };

  Table.prototype.getFullKeys = function() {
    return this.fullRowkeys;
  };

  Table.prototype.getFullCQs = function() {
    return this.fullCQs;
  };

  Table.prototype.removeRow = function(row){
    for(var i=0;i<this.rows.length;i++){
      if(this.rows[i] === row){
        this.rows.splice(i, 1);
      }
    }
  };

  Table.prototype.isEmpty = function(){
    return (this.rows.length === 0);
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

app.factory("Row", function() {
  function Row(key){
    this.key = key;
    this.cqs = [];
  }

  Row.prototype.getKey = function(){
    return this.key;
  };

  Row.prototype.getCQs = function(){
    return this.cqs;
  };

  Row.prototype.createCQ = function(name, value){
    this.cqs.push({
      "name": name,
      "value": value
    });
  };

  Row.prototype.updateCQ = function(name, value){
    for(var i=0;i<this.cqs.length;i++){
      if(this.cqs[i].name === name){
        this.cqs[i].value = value;

        break;
      }
    }
  };

  Row.prototype.removeCQ = function(name){
    for(var i=0;i<this.cqs.length;i++){
      if(this.cqs[i].name === name){
        this.cqs.splice(i, 1);

        break;
      }
    }
  };

  return Row;
});

app.factory("Operation", function() {
  Operation.Type = {
    CREATE: 0,
    UPDATE: 1,
    GET: 2,
    SCAN: 3,
    OTHER: 4
  };

  var entities = [];

  function Operation(title, type){
    this.title = title;
    this.type = type;
    this.cqs = {};
  }

  Operation.prototype.getTitle = function(){
    return this.title;
  };

  Operation.prototype.getType = function(){
    return this.type;
  };

  Operation.prototype.getSummary = function(){
    return this.summary;
  };

  Operation.prototype.getTable = function(){
    return this.table;
  };

  Operation.prototype.getKey = function(){
    return this.key;
  };

  Operation.prototype.getCreateCQs = function(){
    return this.cqs.create;
  };

  Operation.prototype.getUpdateCQs = function(){
    return this.cqs.update;
  };

  Operation.prototype.setSummary = function(summary){
    this.summary = summary;
  };

  Operation.prototype.setTable = function(table){
    this.table = table;
  };

  Operation.prototype.setKey = function(key){
    this.key = key;
  };

  Operation.prototype.createCQ = function(name, value){
    this.cqs.create = this.cqs.create || [];

    this.cqs.create.push({
      "name": name,
      "value": value
    });
  };

  Operation.prototype.updateCQ = function(name, oldvalue, newvalue){
    this.cqs.update = this.cqs.update || [];

    this.cqs.update.push({
      "name": name,
      "oldvalue": oldvalue,
      "newvalue": newvalue
    });
  };

  Operation.create = function(operation){
    entities.push(operation);
  };

  Operation.findAll = function(){
    return entities;
  };

  return Operation;
});
