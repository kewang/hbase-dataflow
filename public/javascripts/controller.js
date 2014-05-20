var app = angular.module("hbase-dataflow-app", []);

app.controller("dataflow", function($scope){
  $scope.cqs = [];
  $scope.tableList = [];
  $scope.tmp_cqs = [];
  $scope.current_cqs = [];
  $scope.current_rowkeys;

  $scope.createTable = function() {
    var name = prompt("Create a new table");
    var t = new Table(name);

    this.tableList.push(t);
  };

  $scope.addCQ = function() {
    this.tmp_cqs.push({});
  };

  $scope.createRowkeyAndCQ = function() {
    this.selectTable2.createRowkey(this.tmp_rk);

    for(var i=0;i<this.tmp_cqs.length;i++){
      this.selectTable2.createCQ(this.tmp_rk, this.tmp_cqs[i].name, this.tmp_cqs[i].value);
    }

    this.tmp_rk = "";
    this.tmp_cqs = [];

    $("#create-qualifiers-dialog").modal("hide");
  };

  $scope.showTable = function() {
    var rowkeys = this.selectTable1.rowkeys;

    this.current_rowkeys = [];

    for(var i=0;i<rowkeys.length;i++){
      for(var j=0;j<rowkeys[i].cqs.length;j++){
        var cq = rowkeys[i].cqs[j];

        // not found the same CQ
        if(this.current_cqs.indexOf(cq.name) == -1){
          this.current_cqs.push(cq.name);
        }
      }
    }

    for(var i=0;i<rowkeys.length;i++){
      var cqs = [];

      for(var j=0;j<this.current_cqs.length;j++){
        var found = false;

        for(var k=0;k<rowkeys[i].cqs.length;k++){
          var cq = rowkeys[i].cqs[k];

          if(this.current_cqs[j] === cq.name){
            cqs.push(cq.value);

            found=true;

            break;
          }
        }

        if(!found){
          cqs.push(null);
        }
      }

      this.current_rowkeys.push({
        "rowkey": rowkeys[i].rowkey,
        "cqs": cqs
      });
    }
  };
});
