# Reads the license file and returns its contents formatted as
# a multiline JavaScript comment for embedding in source code
jake_helper :license do
  "/**\n" + File.read('MIT-LICENSE').split(/\n/).map { |line|
    " * #{ line }"
  }.join("\n") + "\n */"
end

jake_hook :build_complete do |build|
  %w[CHANGELOG MIT-LICENSE].each do |doc|
    FileUtils.cp doc, "#{build.build_directory}/#{doc}"
  end
  
  FileUtils.cp 'README.markdown', "#{build.build_directory}/README"
  
  %w[core stdlib].each do |doc|
    FileUtils.cp build.package(doc).build_path(:min), "site/site/javascripts/js.class/#{doc}.js"
  end
end

