CWD = 'http://localhost:8000'
JSCLASS_PATH = CWD + '/build/min'
JS_DEBUG = true

if (typeof window === 'undefined') {
  basePath        = '..'
  files           = ['test/testacular.js', JSCLASS_PATH + '/loader-browser.js', 'test/runner.js']
  reporters       = ['progress']
  port            = 8080
  runnerPort      = 9100
  colors          = true
  logLevel        = LOG_INFO
  autoWatch       = true
  captureTimeout  = 5000
  singleRun       = false
}

