function Table(name){
  this.name = name;
  this.rowkeys = [];
}

Table.prototype.createRow = function(rowkey, qualifier, value) {
  this.rowkeys[rowkey].qualifiers = [];

  this.rowkeys[rowkey].qualifiers.push({
    qualifier: value
  });
};
