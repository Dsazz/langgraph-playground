#!/bin/bash

# Ensure the script fails if any command fails
set -e

# Download models
echo "Running model download script..."
bash /app/download-models.sh

# Start the application after downloading the models
echo "Starting the application..."
exec uvicorn app:app --host 0.0.0.0 --port 8000 --reload
