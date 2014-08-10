"use strict";

var app = angular.module("hbase-dataflow-app");

app.filter('isEmpty', function() {
  var bar;

  return function(obj) {
    for (bar in obj) {
      if (obj.hasOwnProperty(bar)) {
        return false;
      }
    }

    return true;
  };
});