.PHONY: setup
setup:
	@ npm install --prefix ui
	@ pip install -r api/reuqirements.txt

.PHONY: start
start:
	@ concurrently "npm start --prefix ui" "cd api && uvicorn api:app --reload"

.PHONY: test
test:
	@ CI=true npm test --prefix ui
	@ pytest

.PHONY: test-watch
test-watch:
	@ concurrently "npm test --prefix ui" "pytest-watch"
