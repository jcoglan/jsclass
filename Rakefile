require 'httparty'
require 'nokogiri'
require 'set'

def mdc_url(type)
  'http://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Global_Objects/' + type
end

def document(url)
  puts "Fetching #{url} ..."
  Nokogiri.parse(HTTParty.get(url))
rescue
  document(url)
end

MDC_URLS = %w(Array Boolean Date EvalError Error Function Math
              Number Object RangeError ReferenceError RegExp
              String SyntaxError TypeError URIError).
              map(&method(:mdc_url))

ELEMENT_URL = 'http://developer.mozilla.org/en/DOM/element'
EVENT_URL   = 'http://developer.mozilla.org/en/DOM/event'
STYLE_URL   = 'http://developer.mozilla.org/en/DOM/CSS'

class MethodSet < SortedSet
  def add_method(link)
    name = link.text.strip.gsub(/^event\./, '')
    add(name) if name =~ /^[a-z][a-zA-Z0-9\_\$]*$/
  end
  
  def import(url, selector)
    document(url).search(selector).each(&method(:add_method))
  end
end

namespace :import do
  task :method_chain do
    methods = MethodSet.new
    
    MDC_URLS.each { |url| methods.import(url, 'dt a') }
    
    methods.import(ELEMENT_URL, 'td code a:first-child')
    
    document(ELEMENT_URL).search('#pageText>p').last.search('a').map do |link|
      methods.import(link[:href], 'td code a:first-child')
    end
    
    methods.import(EVENT_URL, 'dt a')
    methods.import(STYLE_URL, 'li a')
    
    p methods.entries
  end
end

