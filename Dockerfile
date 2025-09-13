# Multi-stage build for DriveSmart with Ollama
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt
RUN pip install ollama

# Copy backend code
COPY backend/ backend/

# Copy assets needed for RAG
COPY frontend/assets/staterules/ frontend/assets/staterules/

# Expose port
EXPOSE 5001

# Start script that runs Ollama and the Flask app
COPY start.sh start.sh
RUN chmod +x start.sh

CMD ["./start.sh"]
