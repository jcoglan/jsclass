(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS;

  if (E) exports.JS = exports;
  factory(js, E ? exports : js);

})(function(JS, exports) {
'use strict';

var MethodChain = function(base) {
  var queue      = [],
      baseObject = base || {};

  this.____ = function(method, args) {
    queue.push({func: method, args: args});
  };

  this.__exec__ = function(base) {
    return MethodChain.exec(queue, base || baseObject);
  };
};

MethodChain.exec = function(queue, object) {
  var method, property, i, n;
  loop: for (i = 0, n = queue.length; i < n; i++) {
    method = queue[i];
    if (object instanceof MethodChain) {
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

MethodChain.displayName = 'MethodChain';

MethodChain.toString = function() {
  return 'MethodChain';
};

MethodChain.prototype = {
  __: function() {
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

MethodChain.reserved = (function() {
  var names = [], key;
  for (key in new MethodChain) names.push(key);
  return new RegExp('^(?:' + names.join('|') + ')$');
})();

MethodChain.addMethod = function(name) {
  if (this.reserved.test(name)) return;
  var func = this.prototype[name] = function() {
    this.____(name, arguments);
    return this;
  };
  func.displayName = 'MethodChain#' + name;
};

MethodChain.addMethods = function(object) {
  var methods = [], property, i;

  for (property in object) {
    if (Number(property) !== property) methods.push(property);
  }

  if (object instanceof Array) {
    i = object.length;
    while (i--) {
      if (typeof object[i] === 'string') methods.push(object[i]);
    }
  }
  i = methods.length;
  while (i--) this.addMethod(methods[i]);

  object.__fns__ && this.addMethods(object.__fns__);
  object.prototype && this.addMethods(object.prototype);
};

JS.Method.added(function(method) {
  if (method && method.name) MethodChain.addMethod(method.name);
});

JS.Kernel.include({
  wait: function(time) {
    var chain = new MethodChain(), self = this;

    if (typeof time === 'number')
      JS.ENV.setTimeout(function() { chain.__exec__(self) }, time * 1000);

    if (this.forEach && typeof time === 'function')
      this.forEach(function(item) {
        JS.ENV.setTimeout(function() { chain.__exec__(item) }, time.apply(this, arguments) * 1000);
      });

    return chain;
  },

  __: function() {
    var base = arguments[0],
        args = [],
        i, n;

    for (i = 1, n = arguments.length; i < n; i++) args.push(arguments[i]);
    return  (typeof base === 'object' && base) ||
            (typeof base === 'function' && base.apply(this, args)) ||
            this;
  }
});

(function() {
  var queue = JS.Module.__queue__,
      n     = queue.length;

  while (n--) MethodChain.addMethods(queue[n]);
  delete JS.Module.__queue__;
})();

MethodChain.addMethods([
  "abs", "acos", "addEventListener", "anchor", "animation", "appendChild",
  "apply", "arguments", "arity", "asin", "atan", "atan2", "attributes", "auto",
  "background", "baseURI", "baseURIObject", "big", "bind", "blink", "blur",
  "bold", "border", "bottom", "bubbles", "call", "caller", "cancelBubble",
  "cancelable", "ceil", "charAt", "charCodeAt", "childElementCount",
  "childNodes", "children", "classList", "className", "clear", "click",
  "clientHeight", "clientLeft", "clientTop", "clientWidth", "clip",
  "cloneNode", "color", "columns", "compareDocumentPosition", "concat",
  "constructor", "contains", "content", "contentEditable", "cos", "create",
  "css", "currentTarget", "cursor", "dataset", "defaultPrevented",
  "defineProperties", "defineProperty", "dir", "direction", "dispatchEvent",
  "display", "endsWith", "eval", "eventPhase", "every", "exec", "exp",
  "explicitOriginalTarget", "filter", "firstChild", "firstElementChild",
  "fixed", "flex", "float", "floor", "focus", "font", "fontcolor", "fontsize",
  "forEach", "freeze", "fromCharCode", "getAttribute", "getAttributeNS",
  "getAttributeNode", "getAttributeNodeNS", "getBoundingClientRect",
  "getClientRects", "getDate", "getDay", "getElementsByClassName",
  "getElementsByTagName", "getElementsByTagNameNS", "getFeature",
  "getFullYear", "getHours", "getMilliseconds", "getMinutes", "getMonth",
  "getOwnPropertyDescriptor", "getOwnPropertyNames", "getPrototypeOf",
  "getSeconds", "getTime", "getTimezoneOffset", "getUTCDate", "getUTCDay",
  "getUTCFullYear", "getUTCHours", "getUTCMilliseconds", "getUTCMinutes",
  "getUTCMonth", "getUTCSeconds", "getUserData", "getYear", "global",
  "hasAttribute", "hasAttributeNS", "hasAttributes", "hasChildNodes",
  "hasOwnProperty", "height", "hyphens", "icon", "id", "ignoreCase", "imul",
  "indexOf", "inherit", "initEvent", "initial", "innerHTML",
  "insertAdjacentHTML", "insertBefore", "is", "isArray", "isContentEditable",
  "isDefaultNamespace", "isEqualNode", "isExtensible", "isFinite", "isFrozen",
  "isGenerator", "isInteger", "isNaN", "isPrototypeOf", "isSameNode",
  "isSealed", "isSupported", "isTrusted", "italics", "join", "keys", "lang",
  "lastChild", "lastElementChild", "lastIndex", "lastIndexOf", "left",
  "length", "link", "localName", "localeCompare", "log", "lookupNamespaceURI",
  "lookupPrefix", "map", "margin", "marks", "mask", "match", "max", "min",
  "mozMatchesSelector", "mozRequestFullScreen", "multiline", "name",
  "namespaceURI", "nextElementSibling", "nextSibling", "nodeArg", "nodeName",
  "nodePrincipal", "nodeType", "nodeValue", "none", "normal", "normalize",
  "now", "offsetHeight", "offsetLeft", "offsetParent", "offsetTop",
  "offsetWidth", "opacity", "order", "originalTarget", "orphans", "otherNode",
  "outerHTML", "outline", "overflow", "ownerDocument", "padding", "parentNode",
  "parse", "perspective", "pop", "position", "pow", "prefix", "preventBubble",
  "preventCapture", "preventDefault", "preventExtensions",
  "previousElementSibling", "previousSibling", "propertyIsEnumerable",
  "prototype", "push", "querySelector", "querySelectorAll", "quote", "quotes",
  "random", "reduce", "reduceRight", "removeAttribute", "removeAttributeNS",
  "removeAttributeNode", "removeChild", "removeEventListener", "replace",
  "replaceChild", "resize", "reverse", "right", "round", "schemaTypeInfo",
  "scrollHeight", "scrollIntoView", "scrollLeft", "scrollTop", "scrollWidth",
  "seal", "search", "setAttribute", "setAttributeNS", "setAttributeNode",
  "setAttributeNodeNS", "setCapture", "setDate", "setFullYear", "setHours",
  "setIdAttribute", "setIdAttributeNS", "setIdAttributeNode",
  "setMilliseconds", "setMinutes", "setMonth", "setSeconds", "setTime",
  "setUTCDate", "setUTCFullYear", "setUTCHours", "setUTCMilliseconds",
  "setUTCMinutes", "setUTCMonth", "setUTCSeconds", "setUserData", "setYear",
  "shift", "sin", "slice", "small", "some", "sort", "source", "spellcheck",
  "splice", "split", "sqrt", "startsWith", "sticky",
  "stopImmediatePropagation", "stopPropagation", "strike", "style", "sub",
  "substr", "substring", "sup", "tabIndex", "tagName", "tan", "target", "test",
  "textContent", "timeStamp", "title", "toDateString", "toExponential",
  "toFixed", "toGMTString", "toISOString", "toInteger", "toJSON",
  "toLocaleDateString", "toLocaleFormat", "toLocaleLowerCase",
  "toLocaleString", "toLocaleTimeString", "toLocaleUpperCase", "toLowerCase",
  "toPrecision", "toSource", "toString", "toTimeString", "toUTCString",
  "toUpperCase", "top", "transform", "transition", "trim", "trimLeft",
  "trimRight", "type", "unshift", "unwatch", "valueOf", "visibility", "w3c",
  "watch", "widows", "width"
]);

exports.MethodChain = MethodChain;
});

