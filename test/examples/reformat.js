// This script reads a JS.Test JSON output stream from stdin and reformats it
// using any of the terminal-based test reporters, e.g. dot, spec, error, tap.
//
// Try it out on the JS.Test suite:
//
//     $ node test/console -f json | node test/examples/reformat -f tap

JSCLASS_PATH = 'build/src'
require('../../' + JSCLASS_PATH + '/loader')
JS.require('JS.Test')

var options  = require('nopt')({format: String}),
    R        = JS.Test.Reporters,
    Printer  = R.find(options.format),
    reporter = new R.Composite(),
    reader   = new R.JSON.Reader(reporter)

reporter.addReporter(new Printer())
reporter.addReporter(new R.ExitStatus())

process.stdin.on('data', function(data) {
  data.toString().split('\n').forEach(reader.method('read'))
})
process.stdin.resume()

