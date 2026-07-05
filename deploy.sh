#!/bin/bash
set -e

echo "=== GPT Image Studio - Quick Deploy ==="
echo ""

# Check prerequisites
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi
if ! command -v docker compose &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# Check .env
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "No .env file found. Creating from .env.example..."
        cp .env.example .env
        echo "Please edit .env with your settings before running again."
        echo "At minimum, set MYSQL_PASSWORD to a secure value."
        exit 0
    else
        echo "Error: No .env file found"
        exit 1
    fi
fi

echo "Building and starting containers..."
docker compose build app --no-cache
docker compose up -d
docker builder prune -f 2>/dev/null || true

echo ""
echo "=== Deployment complete ==="
echo "Server: http://localhost:3000"
echo ""
echo "First user to register becomes admin."
echo ""
echo "To view logs: docker compose logs -f app"
echo "To stop:     docker compose down"