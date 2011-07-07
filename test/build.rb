ENGINES = [
  ['v8'],
  ['node', 'nvm use v0.4.1', 'node-0.4.1'],
  ['node', 'nvm use v0.3.8', 'node-0.3.8'],
  ['node', 'nvm use v0.2.6', 'node-0.2.6'],
  ['rhino'],
  ['narwhal'],
  ['ringo'],
  ['spidermonkey']
]

results = ENGINES.map do |engine, setup, name|
  puts "Running tests on #{name || engine}..."
  system(setup) if setup
  
  output  = `#{engine} test/console.js`
  result  = output.split(/\n/).last.scan(/(\d+) [a-z]+/).flatten[-4..-1]
  passed  = (result[-2..-1] == %w[0 0])
  message = passed ? 'PASS: ' : 'FAIL: '
  puts message + result.join(', ')
  
  passed
end

exit(results.all? ? 0 : 1)
