require 'rake'

task :default do
  if ENV['q']
    Rake::Task[:grape].invoke
  end
end

desc "Searches all project files and lists those whose contents match the regexp"
task :grape do
  require 'grape'
  grape = Grape.new(:dir => '.', :excluded_dirs => %w(build releases),
      :extensions => %w(js html haml))
  results = grape.search(ENV['q'],
    :case_sensitive => !!ENV['cs'],
    :verbose => !!ENV['v'],
    :window => ENV['v']
  )
  grape.print_results(results)
end
