@echo off

docker-compose "rm" "-s" "-v" "api" && docker-compose "build" "api" && docker-compose "up" "api"