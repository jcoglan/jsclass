JS.MethodChain = function(base) {
  var queue      = [],
      baseObject = base || {};
  
  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };
  
  this.fire = function(base) {
    return JS.MethodChain.fire(queue, base || baseObject);
  };
};

JS.MethodChain.fire = function(queue, object) {
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
    return function(object) { return chain.fire(object); };
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

JS.Module.methodAdded(function(name) {
  JS.MethodChain.addMethod(name);
});

JS.Kernel.include({
  wait: function(time) {
    var chain = new JS.MethodChain;
    
    typeof time === 'number' &&
      setTimeout(chain.fire.bind(chain, this), time * 1000);
    
    this.forEach && typeof time === 'function' &&
      this.forEach(function() {
        setTimeout(chain.fire.bind(chain, arguments[0]), time.apply(this, arguments) * 1000);
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

(function() {
  var queue = JS.Module.__chainq__,
      n     = queue.length;
  
  while (n--) JS.MethodChain.addMethods(queue[n]);
  JS.Module.__chainq__ = null;
})();

JS.MethodChain.addMethods([
  "abbr", "abs", "accept", "acceptCharset", "accesskey", "acos", "action", "addEventListener", 
  "adjacentNode", "align", "alignWithTop", "alink", "alt", "anchor", "appendChild", "appendedNode", 
  "apply", "archive", "arguments", "arity", "asin", "atan", "atan2", "attrNode", "attributes", 
  "axis", "background", "bgcolor", "big", "blink", "blur", "bold", "border", "call", "caller", 
  "ceil", "cellpadding", "cellspacing", "char", "charAt", "charCodeAt", "charoff", "charset", 
  "checked", "childNodes", "cite", "className", "classid", "clear", "click", "clientHeight", 
  "clientLeft", "clientTop", "clientWidth", "cloneNode", "code", "codebase", "codetype", "color", 
  "cols", "colspan", "compact", "concat", "content", "coords", "cos", "data", "datetime", "declare", 
  "deep", "defer", "dir", "disabled", "dispatchEvent", "enctype", "event", "every", "exec", "exp", 
  "face", "filter", "firstChild", "fixed", "floor", "focus", "fontcolor", "fontsize", "forEach", 
  "frame", "frameborder", "fromCharCode", "getAttribute", "getAttributeNS", "getAttributeNode", 
  "getAttributeNodeNS", "getDate", "getDay", "getElementsByTagName", "getElementsByTagNameNS", 
  "getFullYear", "getHours", "getMilliseconds", "getMinutes", "getMonth", "getSeconds", "getTime", 
  "getTimezoneOffset", "getUTCDate", "getUTCDay", "getUTCFullYear", "getUTCHours", 
  "getUTCMilliseconds", "getUTCMinutes", "getUTCMonth", "getUTCSeconds", "getYear", "global", 
  "handler", "hasAttribute", "hasAttributeNS", "hasAttributes", "hasChildNodes", "hasOwnProperty", 
  "headers", "height", "href", "hreflang", "hspace", "htmlFor", "httpEquiv", "id", "ignoreCase", 
  "index", "indexOf", "innerHTML", "input", "insertBefore", "insertedNode", "isPrototypeOf", "ismap", 
  "italics", "join", "label", "lang", "language", "lastChild", "lastIndex", "lastIndexOf", "length", 
  "link", "listener", "localName", "log", "longdesc", "map", "marginheight", "marginwidth", "match", 
  "max", "maxlength", "media", "method", "min", "multiline", "multiple", "name", "namespace", 
  "namespaceURI", "nextSibling", "node", "nodeName", "nodeType", "nodeValue", "nohref", "noresize", 
  "normalize", "noshade", "now", "nowrap", "object", "offsetHeight", "offsetLeft", "offsetParent", 
  "offsetTop", "offsetWidth", "onblur", "onchange", "onclick", "ondblclick", "onfocus", "onkeydown", 
  "onkeypress", "onkeyup", "onload", "onmousedown", "onmousemove", "onmouseout", "onmouseover", 
  "onmouseup", "onreset", "onselect", "onsubmit", "onunload", "ownerDocument", "parentNode", "parse", 
  "pop", "pow", "prefix", "previousSibling", "profile", "prompt", "propertyIsEnumerable", "push", 
  "random", "readonly", "reduce", "reduceRight", "rel", "removeAttribute", "removeAttributeNS", 
  "removeAttributeNode", "removeChild", "removeEventListener", "removedNode", "replace", 
  "replaceChild", "replacedNode", "rev", "reverse", "round", "rows", "rowspan", "rules", "scheme", 
  "scope", "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTop", "scrollWidth", "scrolling", 
  "search", "selected", "setAttribute", "setAttributeNS", "setAttributeNode", "setAttributeNodeNS", 
  "setDate", "setFullYear", "setHours", "setMilliseconds", "setMinutes", "setMonth", "setSeconds", 
  "setTime", "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds", "setUTCMinutes", 
  "setUTCMonth", "setUTCSeconds", "setYear", "shape", "shift", "sin", "size", "slice", "small", 
  "some", "sort", "source", "span", "splice", "split", "sqrt", "src", "standby", "start", "strike", 
  "style", "sub", "substr", "substring", "summary", "sup", "tabIndex", "tabindex", "tagName", "tan", 
  "target", "test", "text", "textContent", "title", "toArray", "toFunction", "toGMTString", 
  "toLocaleDateString", "toLocaleFormat", "toLocaleString", "toLocaleTimeString", "toLowerCase", 
  "toSource", "toString", "toUTCString", "toUpperCase", "type", "unshift", "unwatch", "useCapture", 
  "usemap", "valign", "value", "valueOf", "valuetype", "version", "vlink", "vspace", "watch", "width"
]);
