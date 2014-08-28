"use strict";

var app = angular.module("hbase-dataflow-app");

app.directive('hbaseTable', function($modal) {
  return {
    restrict: 'E',
    templateUrl: 'includes/hbase_table',
    scope: {
      table: "="
    },
    link: function(scope, elem, attrs) {
      // MUST ADD FILTER MENU
      scope.filterByColumn = function(column) {
        alert(column);
      };

      // MUST ADD FILTER MENU
      scope.filterByRowkey = function(rowkey) {
        $modal.open({
          templateUrl: "includes/rowkey_filter_dialog",
          controller: "RowkeyFilterDialogCtrl",
          size: "lg",
          windowClass: "dialog",
          resolve: {
            rowkey: function() {
              return rowkey;
            }
          }
        });
      };

      // MUST ADD FILTER MENU
      scope.filterByValue = function(value) {
        alert(JSON.stringify(value));
      };

      scope.showValues = function(column) {
        alert(JSON.stringify(column, null, 2));
      };

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

        function traversingFamily(families, inColumns, callback) {
          for (var i = 0; i < families.length; i++) {
            var family = families[i];
            var columns = family.getColumns();

            for (var j = 0; j < columns.length; j++) {
              var column = angular.copy(columns[j]);

              column.setName(family.getName() + ":" + column.getName());

              var index = findColumnIndex(inColumns, column);

              callback(index, column);
            }
          }
        }

        function buildColumns(rows) {
          var returnColumns = [];

          for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var families = row.getColumns();

            traversingFamily(families, returnColumns, function(index, column) {
              if (index === -1) {
                returnColumns.push(column);
              }
            });
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
            scope.rows = [];
            scope.columns = buildColumns(rows);

            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              var families = row.getColumns();
              var columns = createFixedLengthArray(scope.columns.length);

              traversingFamily(families, scope.columns, function(index, column) {
                for (var j = 0; j < scope.columns.length; j++) {
                  // get all columns
                  if (index === j) {
                    columns[j] = columns[j] && column;
                  } else {
                    columns[j] = columns[j] || null;
                  }
                }
              });

              scope.rows.push({
                key: row.getKey(),
                columns: columns
              });
            }
          }
        }
      }, true);
    }
  };
});