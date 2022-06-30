@echo off

docker-compose "down" && docker-compose "build" && docker-compose "up" "-d" "db" && docker-compose "up" "api"