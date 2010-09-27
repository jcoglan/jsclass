JS.MethodChain = function(base) {
  var queue      = [],
      baseObject = base || {};
  
  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };
  
  this.__exec__ = function(base) {
    return JS.MethodChain.exec(queue, base || baseObject);
  };
};

JS.MethodChain.exec = function(queue, object) {
  var method, property, i, n;
  loop: for (i = 0, n = queue.length; i < n; i++) {
    method = queue[i];
    if (object instanceof JS.MethodChain) {
      object.____(method.func, method.args);
      continue;
    }
    switch (typeof method.func) {
      case 'string':    property = object[method.func];       break;
      case 'function':  property = method.func;               break;
      case 'object':    object = method.func; continue loop;  break;
    }
    object = (typeof property === 'function')
        ? property.apply(object, method.args)
        : property;
  }
  return object;
};

JS.MethodChain.toString = function() {
  return 'MethodChain';
};

JS.MethodChain.prototype = {
  _: function() {
    var base = arguments[0],
        args, i, n;
    
    switch (typeof base) {
      case 'object': case 'function':
        args = [];
        for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
        this.____(base, args);
    }
    return this;
  },
  
  toFunction: function() {
    var chain = this;
    return function(object) { return chain.__exec__(object); };
  }
};

JS.MethodChain.reserved = (function() {
  var names = [], key;
  for (key in new JS.MethodChain) names.push(key);
  return new RegExp('^(?:' + names.join('|') + ')$');
})();

JS.MethodChain.addMethod = function(name) {
  if (this.reserved.test(name)) return;
  var func = this.prototype[name] = function() {
    this.____(name, arguments);
    return this;
  };
  func.displayName = 'MethodChain#' + name;
};

JS.MethodChain.displayName = 'MethodChain';

JS.MethodChain.addMethods = function(object) {
  var methods = [], property, i;
  
  for (property in object)
    Number(property) !== property && methods.push(property);
  
  if (object instanceof Array) {
    i = object.length;
    while (i--)
      typeof object[i] === 'string' && methods.push(object[i]);
  }
  i = methods.length;
  while (i--) this.addMethod(methods[i]);
  
  object.__fns__ && this.addMethods(object.__fns__);
  object.prototype && this.addMethods(object.prototype);
};

it = its = function() { return new JS.MethodChain; };

//JS.Module.methodAdded(function(name) {
//  JS.MethodChain.addMethod(name);
//});

JS.Kernel.include({
  wait: function(time) {
    var chain = new JS.MethodChain(), self = this;
    
    if (typeof time === 'number')
      setTimeout(function() { chain.__exec__(self) }, time * 1000);
    
    if (this.forEach && typeof time === 'function')
      this.forEach(function(item) {
        setTimeout(function() { chain.__exec__(item) }, time.apply(this, arguments) * 1000);
      });
    
    return chain;
  },
  
  _: function() {
    var base = arguments[0],
        args = [],
        i, n;
    
    for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
    return  (typeof base === 'object' && base) ||
            (typeof base === 'function' && base.apply(this, args)) ||
            this;
  }
}, true);

//(function() {
//  var queue = JS.Module.__chainq__,
//      n     = queue.length;
//  
//  while (n--) JS.MethodChain.addMethods(queue[n]);
//  JS.Module.__chainq__ = null;
//})();

JS.MethodChain.addMethods([
  "abs", "accept", "accessKey", "acos", "addEventListener", "align", "alt",
  "altKey", "anchor", "appendChild", "apply", "arguments", "arity", "asin",
  "atan", "atan2", "attributes", "azimuth", "background", "backgroundAttachment",
  "backgroundColor", "backgroundImage", "backgroundPosition", "backgroundRepeat",
  "baseURI", "baseURIObject", "big", "blink", "blur", "bold", "border",
  "borderBottom", "borderBottomColor", "borderBottomStyle", "borderBottomWidth",
  "borderCollapse", "borderColor", "borderLeft", "borderLeftColor",
  "borderLeftStyle", "borderLeftWidth", "borderRight", "borderRightColor",
  "borderRightStyle", "borderRightWidth", "borderSpacing", "borderStyle",
  "borderTop", "borderTopColor", "borderTopStyle", "borderTopWidth",
  "borderWidth", "bottom", "bubbles", "button", "call", "caller", "clientHeight",
  "clientLeft", "clientTop", "clientWidth", "clientX", "clientY", "clip",
  "cloneNode", "color", "cols", "compareDocumentPosition", "concat",
  "constructor", "content", "cos", "counterIncrement", "counterReset",
  "create", "cssFloat", "ctrlKey", "cue", "cueAfter", "cueBefore",
  "currentTarget", "cursor", "defaultChecked", "defaultValue",
  "defineProperties", "defineProperty", "description", "detail", "dir",
  "direction", "disabled", "dispatchEvent", "display", "elevation", "emptyCells",
  "eval", "eventPhase", "every", "exec", "exp", "explicitOriginalTarget",
  "fileName", "files", "filter", "firstChild", "fixed", "floor", "focus", "font",
  "fontFamily", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle",
  "fontVariant", "fontWeight", "fontcolor", "fontsize", "forEach", "form",
  "fromCharCode", "getAttribute", "getAttributeNS", "getAttributeNode",
  "getAttributeNodeNS", "getDate", "getDay", "getElementsByClassName",
  "getElementsByTagName", "getElementsByTagNameNS", "getFullYear", "getHours",
  "getMilliseconds", "getMinutes", "getMonth", "getOwnPropertyDescriptor",
  "getPrototypeOf", "getSeconds", "getTime", "getTimezoneOffset", "getUTCDate",
  "getUTCDay", "getUTCFullYear", "getUTCHours", "getUTCMilliseconds",
  "getUTCMinutes", "getUTCMonth", "getUTCSeconds", "getYear", "global",
  "hasAttribute", "hasAttributeNS", "hasAttributes", "hasChildNodes",
  "hasOwnProperty", "height", "id", "ignoreCase", "imeMode", "index", "indexOf",
  "initEvent", "initKeyEvent", "initMessageEvent", "initMouseEvent",
  "initUIEvent", "innerHTML", "input", "insertBefore", "isChar",
  "isDefaultNamespace", "isPrototypeOf", "isSameNode", "isSupported", "italics",
  "join", "keyCode", "lang", "lastChild", "lastIndex", "lastIndexOf", "layerX",
  "layerY", "left", "length", "letterSpacing", "lineHeight", "lineNumber",
  "link", "listStyle", "listStyleImage", "listStylePosition", "listStyleType",
  "localName", "localeCompare", "log", "map", "margin", "marginBottom",
  "marginLeft", "marginRight", "marginTop", "markerOffset", "marks", "match",
  "max", "maxHeight", "maxLength", "maxWidth", "message", "metaKey", "min",
  "minHeight", "minWidth", "mozMatchesSelector", "mozSetFileNameArray",
  "multiline", "multiple", "name", "namespaceURI", "nextSibling", "nodeArg",
  "nodeName", "nodePrincipal", "nodeType", "nodeValue", "normalize", "now",
  "nsIDOMNodeList", "nsIPrincipal", "nsIURI", "number", "offsetHeight",
  "offsetLeft", "offsetParent", "offsetTop", "offsetWidth", "opacity",
  "originalTarget", "orphans", "otherNode", "outline", "outlineColor",
  "outlineOffset", "outlineStyle", "outlineWidth", "overflow", "overflowX",
  "overflowY", "ownerDocument", "padding", "paddingBottom", "paddingLeft",
  "paddingRight", "paddingTop", "page", "pageBreakAfter", "pageBreakBefore",
  "pageBreakInside", "pageX", "pageY", "parentNode", "parse", "pause",
  "pauseAfter", "pauseBefore", "pitch", "pitchRange", "playDuring", "pop",
  "position", "pow", "prefix", "preventBubble", "preventCapture",
  "preventDefault", "previousSibling", "propertyIsEnumerable", "prototype",
  "push", "querySelector", "querySelectorAll", "quote", "quotes", "random",
  "readOnly", "reduce", "reduceRight", "relatedTarget", "removeAttribute",
  "removeAttributeNS", "removeAttributeNode", "removeChild",
  "removeEventListener", "replace", "replaceChild", "reverse", "richness",
  "right", "round", "rows", "screenX", "screenY", "scrollHeight",
  "scrollIntoView", "scrollLeft", "scrollTop", "scrollWidth", "search",
  "select", "selectionEnd", "selectionStart", "setAttribute", "setAttributeNS",
  "setAttributeNode", "setAttributeNodeNS", "setDate", "setFullYear", "setHours",
  "setMilliseconds", "setMinutes", "setMonth", "setSeconds", "setSelectionRange",
  "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds",
  "setUTCMinutes", "setUTCMonth", "setUTCSeconds", "setYear", "shift",
  "shiftKey", "sin", "size", "slice", "small", "some", "sort", "source", "speak",
  "speakHeader", "speakNumeral", "speakPunctuation", "speechRate", "spellcheck",
  "splice", "split", "sqrt", "src", "stack", "sticky", "stopPropagation",
  "stress", "strike", "style", "sub", "substr", "substring", "sup", "tabIndex",
  "tableLayout", "tagName", "tan", "target", "test", "textAlign", "textContent",
  "textDecoration", "textIndent", "textLength", "textShadow", "textTransform",
  "timeStamp", "title", "toDateString", "toExponential", "toFixed",
  "toGMTString", "toLocaleDateString", "toLocaleFormat", "toLocaleLowerCase",
  "toLocaleString", "toLocaleTimeString", "toLocaleUpperCase", "toLowerCase",
  "toPrecision", "toSource", "toString", "toTimeString", "toUTCString",
  "toUpperCase", "top", "trim", "trimLeft", "trimRight", "type", "unicodeBidi",
  "unshift", "unwatch", "useMap", "value", "valueOf", "verticalAlign", "view",
  "visibility", "voiceFamily", "volume", "watch", "which", "whiteSpace",
  "widows", "width", "wordSpacing", "wordWrap", "wrap", "zIndex"
]);

