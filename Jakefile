# Reads the license file and returns its contents formatted as
# a multiline JavaScript comment for embedding in source code
jake :license do
  "/**\n" + File.read('MIT-LICENSE').split(/\n/).map { |line|
    " * #{ line }"
  }.join("\n") + "\n */"
end

jake :after_build do |build|
  %w[CHANGELOG MIT-LICENSE].each do |doc|
    FileUtils.cp doc, "#{build.build_directory}/#{doc}"
  end 
end

