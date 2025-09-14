# Simple Python Flask deployment with Ollama
FROM python:3.11-slim

# Install system dependencies and Ollama
RUN apt-get update && apt-get install -y curl wget && \
    curl -fsSL https://ollama.ai/install.sh | sh && \
    rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements and install Python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code
COPY backend/ ./

# Copy state manual text files for RAG
COPY frontend/assets/staterules/*.txt ./staterules/

EXPOSE 5001

# Use bash directly in CMD to avoid script file issues
CMD ["/bin/bash", "-c", "echo 'Starting Ollama...' && ollama serve & sleep 20 && echo 'Pulling model...' && ollama pull mistral:latest && echo 'Starting Flask...' && exec python app.py"]
