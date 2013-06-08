var Common = {name: 'CommonJS module'};
var HTTP = {name: 'CommonJS HTTP lib'};

if (typeof exports === 'object') {
  exports.Common = Common;
  exports.HTTP = HTTP;
}
