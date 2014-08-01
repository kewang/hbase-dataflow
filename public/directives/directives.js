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
      // deep watch attrs.table
      scope.$watch(attrs.table, function(table) {
        if (table) {
          var rows = table.getRows();

          if (rows.length) {

          }
        }
      }, true);
    }
  };
});