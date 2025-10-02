#!/bin/bash

echo "🚀 Starting Demo Application..."
echo ""
echo "This will start:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please add your OPENAI_API_KEY before continuing."
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit and edit .env..."
fi

echo "🐳 Starting Docker containers..."
docker-compose up --build
