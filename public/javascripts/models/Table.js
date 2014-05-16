function Table(name){
  this.name = name;
  this.rowkeys = [];
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
