# frozen_string_literal: true

require 'rake/clean'

GITHUB_TOKEN = ENV['GITHUB_TOKEN']
GITHUB_ACTOR = 'marcmo'
GITHUB_REPOSITORY = 'esrlabs/chipmunk-docs'
INPUT_GIT_COMMIT_MESSAGE = 'generated site content'
SITE_DIR = 'jekyll/_site'
SITE = "#{SITE_DIR}/index.html"
DOCS = 'jekyll/_site/book'
MDBOOK_DIR = 'book'

directory SITE_DIR
CLEAN.include(SITE_DIR)

task :clean => :clean_book

task :clean_book do
  cd MDBOOK_DIR do
    sh 'mdbook clean'
  end
end

desc 'install'
task :install do
  sh 'bundle install'
end

desc 'build jekyll site'
task :build_jekyll do
  cd 'jekyll' do
    sh ''"
      docker run \
        -v \"$(pwd):/workspace\" \
        -w /workspace \
        --user #{Process.uid}:#{Process.gid} \
        meatlink/chipmunk-docs-builder-gha:latest \
        bundle exec jekyll build
    "''
  end
  sh "touch ./#{SITE_DIR}/.nojekyll"
end

desc 'watch & serve jekyll site only'
task :watch_serve do
  cd 'jekyll' do
    sh 'bundle exec jekyll serve -l --baseurl='
  end
end

desc 'build'
task :build => [SITE, DOCS]

desc 'build mdbook documentation'
task :book => SITE_DIR do
  cd MDBOOK_DIR do
    sh 'mdbook build'
    mv 'book', "../#{DOCS}"
  end
end

task :clean_docs do
  rm_r DOCS if Dir.exist?(DOCS)
end
desc 'python webserver'
task :preview_mdbook do
  cd MDBOOK_DIR do
    sh 'mdbook serve'
  end
end

file SITE => :build_jekyll
file DOCS => :book
