var page = new WebPage()

page.onConsoleMessage = function(message) {
  try {
    var data = JSON.parse(message).jstest
    if (!data) return;
    
    if (data.status) {
      var message = '[' + data.status.toUpperCase() + '] ' + data.test
      return console.log(message)
    }
    
    var status = (!data.fail && !data.error) ? 0 : 1
    console.log(data.total + ' tests, ' + data.fail + ' failures, ' + data.error + ' errors')
    phantom.exit(status)
    
  } catch (e) {}
}
page.open('test/browser.html')

