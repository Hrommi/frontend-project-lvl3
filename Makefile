install:
	npm install

build:
	NODE_ENV=production npx webpack

start:
	npx webpack-dev-server

lint:
	npx eslint .

test:
	npm test
