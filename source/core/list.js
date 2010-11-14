JS.List = JS.makeClass();

JS.extend(JS.List.prototype, {
  initialize: function() {
    this.head = this.tail = null;
  },
  
  push: function(node) {
    if (this.tail) {
      this.tail.next = node;
      node.prev = this.tail;
      node.next = null;
      this.tail = node;
    } else {
      this.head = this.tail = node;
      node.prev = node.next = null;
    }
  }
});

