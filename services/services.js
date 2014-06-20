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

        break;
      }
    }
  };

  Table.prototype.findRowByKey = function(key){
    for(var i=0;i<this.rows.length;i++){
      if(this.rows[i].key === key){
        return this.rows[i];
      }
    }
  };

  //from prefix
  Table.prototype.scanRowsByKey = function(key){
    var search = [];

    for(var i=0;i<this.rows.length;i++){
      if(this.rows[i].key.indexOf(key) === 0){
        search.push(this.rows[i]);
      }
    }

    return search;
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

  Table.clear = function(){
    entities = [];
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
    OTHER: 3
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

  Operation.prototype.getRows = function(){
    return this.rows;
  };

  Operation.prototype.getCQs = function(){
    return this.cqs;
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

  Operation.prototype.createRow = function(key, cqs, values){
    this.rows = this.rows || [];

    this.cqs = cqs;

    this.rows.push({
      "key": key,
      "values": values
    });
  };

  Operation.create = function(operation){
    entities.push(operation);
  };

  Operation.findAll = function(){
    return entities;
  };

  Operation.clear = function(){
    entities = [];
  };

  return Operation;
});

app.factory("Sample", function() {
  function Sample(){
  }

  Sample.SAMPLE1 = {
    "tables":[{"name":"Mail","rows":[{"key":"12345","cqs":[{"name":"messageId","value":"5fc38314-e290-ae5da5fc375d"},{"name":"timestamp","value":"1307097848"},{"name":"email-message","value":"Hi Lars, ..."}]},{"key":"12345","cqs":[{"name":"messageId","value":"725aae5f-d72e-f90f3f070419"},{"name":"timestamp","value":"1307099848"},{"name":"email-message","value":"Welcome, and ..."}]},{"key":"12345","cqs":[{"name":"messageId","value":"cc6775b3-f249-c6dd2b1a7467"},{"name":"timestamp","value":"1307101848"},{"name":"email-message","value":"To Whom It ..."}]},{"key":"12345","cqs":[{"name":"messageId","value":"dcbee495-6d5e-6ed48124632c"},{"name":"timestamp","value":"1307103848"},{"name":"email-message","value":"Hi, how are ..."}]}]}],"operations":[{"title":"Create 1st mail","type":0,"cqs":{"create":[{"name":"messageId","value":"5fc38314-e290-ae5da5fc375d"},{"name":"timestamp","value":"1307097848"},{"name":"email-message","value":"Hi Lars, ..."}]},"summary":"Create 1st mail, using userId treats as rowkey","table":"Mail","key":"12345"},{"title":"Create 2nd mail","type":0,"cqs":{"create":[{"name":"messageId","value":"725aae5f-d72e-f90f3f070419"},{"name":"timestamp","value":"1307099848"},{"name":"email-message","value":"Welcome, and ..."}]},"table":"Mail","key":"12345"},{"title":"Create 3rd mail","type":0,"cqs":{"create":[{"name":"messageId","value":"cc6775b3-f249-c6dd2b1a7467"},{"name":"timestamp","value":"1307101848"},{"name":"email-message","value":"To Whom It ..."}]},"table":"Mail","key":"12345"},{"title":"Create 4th mail","type":0,"cqs":{"create":[{"name":"messageId","value":"dcbee495-6d5e-6ed48124632c"},{"name":"timestamp","value":"1307103848"},{"name":"email-message","value":"Hi, how are ..."}]},"table":"Mail","key":"12345"},{"title":"Get all User[12345] mails","type":2,"cqs":["messageId","timestamp","email-message"],"summary":"Use Row Key scan all specific userId mails","table":"Mail","rows":[{"key":"12345","values":["5fc38314-e290-ae5da5fc375d","1307097848","Hi Lars, ..."]},{"key":"12345","values":["725aae5f-d72e-f90f3f070419","1307099848","Welcome, and ..."]},{"key":"12345","values":["cc6775b3-f249-c6dd2b1a7467","1307101848","To Whom It ..."]},{"key":"12345","values":["dcbee495-6d5e-6ed48124632c","1307103848","Hi, how are ..."]}]}]
  };

  return Sample;
});
