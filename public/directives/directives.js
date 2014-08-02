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
            scope.columns = [];
            scope.rows = [];

            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              var families = row.getColumns();
              var values = [];

              for (var j = 0; j < families.length; j++) {
                var family = families[j];
                var columns = family.getColumns();

                for (var k = 0; k < columns.length; k++) {
                  // copy a virtual variable
                  var column = angular.copy(columns[k]);

                  column.setName(family.getName() + ":" + column.getName());

                  scope.columns.push(column);

                  values.push(column.getValue());
                }
              }

              scope.rows.push({
                key: row.getKey(),
                values: values
              });
            }
          }
        }
      }, true);
    }
  };
});