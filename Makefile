include .env
install:
	docker compose up -d --build
	docker exec -it ${CONTAINER_NAME} yarn install
up:
	docker compose up -d
down:
	docker compose down
pull:
	git pull
lint:
	docker exec -it ${CONTAINER_NAME} yarn lint
dev:
	docker exec -it ${CONTAINER_NAME} yarn dev --host
build:
	docker exec -it ${CONTAINER_NAME} yarn build
generate:
	docker exec -it ${CONTAINER_NAME} yarn generate
conn:
	docker exec -it ${CONTAINER_NAME} sh