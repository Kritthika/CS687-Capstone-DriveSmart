# Backend-only deployment for Railway with Ollama
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy assets needed for RAG (only text files, not PDFs)
COPY frontend/assets/staterules/*.txt ./backend/staterules/

# Expose port
EXPOSE 5001

# Start script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Set working directory to backend for app execution
WORKDIR /app/backend

CMD ["/app/start.sh"]
