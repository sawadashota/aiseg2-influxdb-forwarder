SHELL := /bin/bash
.DEFAULT_GOAL := help

ROOT_DIR:=$(abspath .)
GRAFANA_BIN_PATH := $(shell which grafana)
GRAFANA_PATH := $(shell dirname $(shell dirname $(GRAFANA_BIN_PATH)))
GRAFANA_HOME := $(GRAFANA_PATH)/share/grafana

export GRAFANA_HOME
export GF_PATHS_PROVISIONING=$(ROOT_DIR)/contrib/grafana

.PHONY: status
process: ## Process status
	@ps aux | grep -E 'influxd|grafana' | grep -v grep

.PHONY: start
start: start-db start-grafana ## Start the application
	@echo "Starting the application..."
	pnpm run start

.PHONY: setup-app
setup-app: ## Setup the application
	@echo "Setting up the application..."
	pnpm install

.PHONY: stop
stop-middleware: stop-db stop-grafana ## Stop the application

.PHONY: setup
setup: setup-db setup-grafana setup ## Setup the application

.PHONY: clean
clean: ## Clean the application
	@echo "Cleaning the application..."
	rm -rf node_modules
	rm -rf .influxdbv2
	rm -rf .grafana

.PHONY: start-db
start-db: ## Start InfluxDB
	@echo "Starting InfluxDB..."
	@influxd \
      --bolt-path=./.influxdbv2/influxd.bolt \
      --sqlite-path=./.influxdbv2/influxd.sqlite \
      --engine-path=./.influxdbv2/engine \
      &>/dev/null &

.PHONY: stop-db
stop-db: ## Stop InfluxDB
	@echo "Kill InfluxDB process..."
	@killall influxd

.PHONY: setup-db
setup-db: ## Setup InfluxDB
	@influx setup \
      --name aiseg2 \
      --username test \
      --password password1 \
      --org test \
      --bucket aiseg2 \
      --retention 12w \
      --token EEKpryGZk8pVDXmIuy484BKUxM5jOEDv7YNoeNZUbsNbpbPbP6kK_qY9Zsyw7zNnlZ7pHG16FYzNaqwLMBUz8g== \
      --force

.PHONY: start-grafana
start-grafana: setup-grafana ## Start Grafana
	@echo "Starting Grafana..."
	@grafana server \
	  --homepath $(GRAFANA_HOME) \
	  --config $(ROOT_DIR)/nix/grafana.ini \
	  cfg:default.paths.data=$(ROOT_DIR)/.grafana/data \
	  &>/dev/null &

.PHONY: stop-grafana
stop-grafana: ## Stop Grafana
	@echo "Kill Grafana process..."
	@killall grafana

.PHONY: setup-grafana
setup-grafana: ## Setup Grafana
	@mkdir -p .grafana/data
	@chmod 777 .grafana

# https://gist.github.com/tadashi-aikawa/da73d277a3c1ec6767ed48d1335900f3
.PHONY: $(shell grep -h -E '^[a-zA-Z_-]+:' $(MAKEFILE_LIST) | sed 's/://')

# https://postd.cc/auto-documented-makefile/
help: ## Show help message
	@grep -h -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
