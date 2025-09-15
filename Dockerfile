# DriveSmart Railway Deployment - Production Ready
FROM python:3.11-slim

# Install system dependencies and Ollama
RUN apt-get update && apt-get install -y curl wget && \
    curl -fsSL https://ollama.ai/install.sh | sh && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code to /app
COPY backend/ ./

# Copy entrypoint script and make executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Copy state manual text files for RAG system
COPY frontend/assets/staterules/*.txt ./staterules/

# Create a backup requirements.txt in the backend path for Railway pre-deploy
# This prevents the "backend/requirements.txt not found" error
RUN mkdir -p backend && cp requirements.txt backend/requirements.txt

# Expose Flask port
EXPOSE 5001

# Use entrypoint script for reliable startup
CMD ["./entrypoint.sh"]
