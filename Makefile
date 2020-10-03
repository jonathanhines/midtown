run:
	bundle exec jekyll serve --livereload --open-url http://localhost:4000/

build:
	bundle exec jekyll build

production-build:
	JEKYLL_ENV=production bundle exec jekyll build

open-theme:
	code $$(bundle info --path minima)