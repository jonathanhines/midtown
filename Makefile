run:
	bundle exec jekyll serve --livereload

build:
	bundle exec jekyll build

open-theme:
	code $$(bundle info --path minima)