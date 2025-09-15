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

# Copy state manual text files for RAG system
COPY frontend/assets/staterules/*.txt ./staterules/

# Expose Flask port
EXPOSE 5001

# Use our Railway-optimized startup script
CMD ["python", "startup.py"]
