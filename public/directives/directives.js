"use strict";

var app = angular.module("hbase-dataflow-app");

app.directive('hbaseTable', function() {
  return {
    restrict: 'E',
    templateUrl: 'includes/hbase_table',
    scope: {
      table: "="
    },
    link: function(scope, elem, attrs) {
      scope.$watch(attrs.table, function(value) {
        console.log(value);
      }, true);
    }
  };
});