var path    = require('path'),
    cleanup = (typeof JSCLASS_PATH === 'undefined');

JSCLASS_PATH = path.dirname(__filename) + '/src';
module.exports = require(JSCLASS_PATH + '/loader');

if (cleanup) delete JSCLASS_PATH;

