function Table(name){
  this.name = name;
  this.rowkeys = [];
  this.fullRowkeys;
  this.fullCQs;
}

Table.prototype.createRowkey = function(rowkey) {
  this.rowkeys.push({
    "rowkey": rowkey,
    "cqs": []
  });
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

Table.prototype.getFullTable = function() {
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
