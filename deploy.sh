#!/bin/bash
# Stop existing containers
docker compose down

# Reclaim space: prune build cache and unused docker images/containers
docker system prune -f

# Rebuild and start the containers
docker compose up -d --build
