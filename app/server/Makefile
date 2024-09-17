#---------------------------------------------#
#--  Makefile   -----------------#
#---------------------------------------------#
#   Author: https://github.com/Hervepoh
#   License: MIT
#---------------------------------------------#

#---VARIABLES---------------------------------#

#---DOCKER---#
DOCKER = docker
DOCKER_RUN = $(DOCKER) run
DOCKER_IMAGE = docker image
DOCKER_COMPOSE = docker compose
DOCKER_COMPOSE_UP = $(DOCKER_COMPOSE) up -d
DOCKER_COMPOSE_UP_ENV = $(DOCKER_COMPOSE) --env-file .env up -d
DOCKER_COMPOSE_STOP = $(DOCKER_COMPOSE) stop
#------------#

#---NPM-----#
NPM = npm
NPM_INSTALL = $(NPM) install
NPM_INSTALL_F = $(NPM) install --force
NPM_UPDATE = $(NPM) update
NPM_RUN = $(NPM) run 
NPM_BUILD = $(NPM) run build
NPM_DEV = $(NPM) run dev
NPM_WATCH = $(NPM) run watch
#------------#

## === 🆘  HELP ==================================================
help: ## Show this help.
	@echo "Stack Docker-Typescript-Mongo-Express-Node"
	@echo "---------------------------"
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@grep -E '(^[a-zA-Z0-9_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
#---------------------------------------------#


## === 🐋  DOCKER ================================================
docker-up-env: ## Start docker containers.
	$(DOCKER_COMPOSE_UP_ENV) 
.PHONY: docker-up

docker-up: ## Start docker containers.
	$(DOCKER_COMPOSE_UP) 
.PHONY: docker-up

docker-stop: ## Stop docker containers.
	$(DOCKER_COMPOSE_STOP)
.PHONY: docker-stop

docker-rm: ## Start docker containers.
	$(DOCKER_COMPOSE) rm
	$(DOCKER_IMAGE) rm backend-api 
.PHONY: docker-up

#---------------------------------------------#

## === 📦  NPM ===================================================
npm-i: ## Install npm dependencies.
	$(NPM_INSTALL)
.PHONY: npm-i

npm-u: ## Update npm dependencies.
	$(NPM_UPDATE)
.PHONY: npm-u

npm-b: ## Build assets.
	$(NPM_BUILD)
.PHONY: npm-b

npm-d: ## Build assets in dev mode.
	$(NPM_DEV)
.PHONY: npm-d

npm-watch: ## Watch assets.
	$(NPM_WATCH)
.PHONY: npm-watch
#---------------------------------------------#

## === 📦 Drizzle ===================================================
drizzle-push: ## Push drizzle schema in the Postgres database
	npx drizzle-kit push
.PHONY: drizzle-push

drizzle-studio: ## Start the drizzle studio to view the database
	npx drizzle-kit studio
.PHONY: drizzle-studio



db-push: ## Push drizzle schema in the Postgres database
	$(NPM_RUN) db:push
.PHONY: db-push

db-studio: ## Start the drizzle studio to view the database
	$(NPM_RUN) db:studio
.PHONY: db-studio

db-up: ## Drizzle can upgrade all the snapshots to latest version
	npx drizzle-kit up
.PHONY: db-up

db-gen: ## Drizzle can generate all migration files
	$(NPM_RUN) db:generate 
.PHONY: db-gen

db-migrate: ## Apply generated migrations to your database directly
	$(NPM_RUN) db:migrate
.PHONY: db-migrate

db-seed: ## Seeding the database
	$(NPM_RUN) db:seed
.PHONY: db-seed

db-prod: ## Seeding the database
	$(NPM_RUN) db:prod
.PHONY: db-prod

db-reset: ## Seeding the database
	$(NPM_RUN) db:reset
.PHONY: db-reset
#---------------------------------------------#

## === 📦 Shadcn-ui ===================================================
shadcn-ui-add-sonner: ## Install sonner
	npx shadcn-ui@latest add sonner
.PHONY: shadcn-ui-add-sonner
#---------------------------------------------#

## === 📦 Stripe ===================================================
stripe-listen: ## 
	stripe listen --forward-to localhost:3000/api/webhooks/stripe
.PHONY: stripe-listen

stripe-trigger: ## 
	stripe trigger payment_intent.succeede
.PHONY: stripe-trigger


## === 🔎  TESTS =================================================

#---------------------------------------------#

## === ⭐  OTHERS =================================================
start: docker-up-env  #sf-start sf-open ## Start project.
.PHONY: start

stop: docker-stop  #sf-stop ## Stop project.
.PHONY: stop

clean: docker-stop docker-rm ## Stop project and clean .
.PHONY: clean

reset-db: ## Reset database.
	$(eval CONFIRM := $(shell read -p "Are you sure you want to reset the database? [y/N] " CONFIRM && echo $${CONFIRM:-N}))
	@if [ "$(CONFIRM)" = "y" ]; then \
		$(MAKE) sf-dd; \
		$(MAKE) sf-dc; \
		$(MAKE) sf-dmm; \
	fi
.PHONY: reset-db
#---------------------------------------------#
