JS.DOM.Builder = new JS.Class('DOM.Builder', {
  extend: {
    addElement: function(name) {
      this.define(name, function() {
        return this.makeElement(name, arguments);
      });
      JS.DOM[name] = function() {
        return new JS.DOM.Builder().makeElement(name, arguments);
      };
    },
    
    addElements: function(list) {
      var i = list.length;
      while (i--) this.addElement(list[i]);
    }
  },
  
  initialize: function(parent) {
    this._parentNode = parent;
  },
  
  makeElement: function(name, children) {
    var element = document.createElement(name), child, attribute;
    for (var i = 0, n = children.length; i < n; i++) {
      child = children[i];
      if (JS.isFn(child)) {
        child(new this.klass(element));
      } else if (JS.isType(child, 'string')) {
        element.appendChild(document.createTextNode(child));
      } else {
        for (attribute in child)
          element.setAttribute(attribute, child[attribute]);
      }
    }
    if (this._parentNode) this._parentNode.appendChild(element);
    return element;
  }
});

JS.DOM.Builder.addElements([
  "a", "abbr", "address", "applet", "area", "article", "aside", "audio", "b",
  "base", "bdo", "blockquote", "body", "br", "button", "canvas", "caption",
  "cite", "code", "col", "colgroup", "command", "datalist", "dd", "del",
  "details", "device", "dfn", "div", "dl", "dt", "em", "embed", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
  "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input",
  "ins", "kbd", "keygen", "label", "legend", "li", "link", "map", "mark",
  "marquee", "menu", "meta", "meter", "nav", "noscript", "object", "ol",
  "optgroup", "option", "output", "p", "param", "pre", "progress", "q", "rp",
  "rt", "ruby", "samp", "script", "section", "select", "small", "source",
  "span", "strong", "style", "sub", "sup", "summary", "table", "tbody", "td",
  "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "ul",
  "var", "video", "wbr"
]);

