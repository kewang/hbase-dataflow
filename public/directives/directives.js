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
        function findColumnIndex(columns, column) {
          var found = -1;

          for (var i = 0; i < columns.length; i++) {
            if (columns[i].getName() === column.getName()) {
              found = i;

              break;
            }
          }

          return found;
        }

        function buildColumns(rows) {
          var returnColumns = [];

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

                var columnIndex = findColumnIndex(returnColumns, column);

                if (columnIndex === -1) {
                  returnColumns.push(column);
                }
              }
            }
          }

          return returnColumns;
        }

        function createFixedLengthArray(size) {
          var array = [];

          for (var i = 0; i < size; i++) {
            array.push({});
          }

          return array;
        }

        if (table) {
          var rows = table.getRows();

          if (rows.length) {
            scope.columns = [];
            scope.rows = [];

            scope.columns = buildColumns(rows);

            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              var families = row.getColumns();
              var values = createFixedLengthArray(scope.columns.length);

              for (var j = 0; j < families.length; j++) {
                var family = families[j];
                var columns = family.getColumns();

                for (var k = 0; k < columns.length; k++) {
                  var column = angular.copy(columns[k]);

                  column.setName(family.getName() + ":" + column.getName());

                  var columnIndex = findColumnIndex(scope.columns, column);

                  for (var l = 0; l < scope.columns.length; l++) {
                    if (l === columnIndex) {
                      values[l] = values[l] && column.getValue();
                    } else {
                      values[l] = values[l] || null;
                    }
                  }
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