#!/bin/bash
DOCKER_BE = training-app
help: ## Show this help message
	@echo 'usage: make [target]'
	@echo
	@echo 'targets:'
	@egrep '^(.+)\:\ ##\ (.+)' ${MAKEFILE_LIST} | column -t -c 2 -s ':#'

start: ## Start the containers
	docker-compose up -d
down: ## down the containers
	docker-compose down
stop: ## Stop the containers
	docker-compose stop

restart: ## Restart the containers
	$(MAKE) stop && $(MAKE) start

# Backend commands
composer-install: ## Installs composer dependencies
	docker exec ${DOCKER_BE} composer install --no-interaction

ng-serve: ## up server angular puerto 4200
	docker exec ${DOCKER_BE} ng serve --host 0.0.0.0 
# End backend commands

ssh-be: ## shell into the be container
	docker exec -it ${DOCKER_BE} sh

code-style: ## Runs php-cs to fix code styling following Symfony rules
	docker exec ${DOCKER_BE} php-cs-fixer fix src --rules=@Symfony
cap-add-android: ## anade plataforma android de Capacitor
	docker exec ${DOCKER_BE} npx cap add android
cap-sync: ## sincroniza web build con Capacitor
	docker exec ${DOCKER_BE} npx cap sync

# Android Studio vive en el host Windows/WSL, no dentro del contenedor Node.
cap-android: ## abre el proyecto android/ en Android Studio (host)
	@ANDROID_DIR="$$(cd android && pwd)"; \
	STUDIO="/mnt/c/Program Files/Android/Android Studio/bin/studio64.exe"; \
	if [ ! -f "$$STUDIO" ]; then \
		printf '%s\n' "No se encontro Android Studio en Windows."; \
		exit 1; \
	fi; \
	WIN_PATH=$$(wslpath -w "$$ANDROID_DIR"); \
	printf 'Abriendo Android Studio con: %s\n' "$$WIN_PATH"; \
	cd /mnt/c/Windows/System32 && "$$STUDIO" "$$WIN_PATH" >/dev/null 2>&1 &
open-android-folder: ## abre la carpeta android/ en el Explorador de Windows
	@ANDROID_DIR="$$(cd android && pwd)"; \
	WIN_PATH=$$(wslpath -w "$$ANDROID_DIR"); \
	printf 'Abriendo carpeta: %s\n' "$$WIN_PATH"; \
	explorer.exe "$$WIN_PATH"

android-fix-perms: ## corrige permisos root dejados por Docker en android/
	docker exec -u root ${DOCKER_BE} chown -R 1000:1000 /home/app/android /home/app/node_modules/@capacitor

# Build Android en WSL (SDK Linux + JDK 21). No usar el contenedor Docker.
apk-debug: android-fix-perms ## genera APK debug en android/app/build/outputs/apk/debug/
	@printf '%s\n' '## Machine-specific (gitignored).' 'sdk.dir=/home/gabriel/Android/Sdk' > android/local.properties
	cd android && \
	JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 \
	ANDROID_HOME=/home/gabriel/Android/Sdk \
	PATH="/usr/lib/jvm/java-21-openjdk-amd64/bin:$$PATH" \
	./gradlew :app:assembleDebug
	@printf 'APK: %s\n' "$$(cd android/app/build/outputs/apk/debug && pwd)/app-debug.apk"
