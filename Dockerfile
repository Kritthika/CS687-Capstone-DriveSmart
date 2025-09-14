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

# Simple startup script
RUN echo '#!/bin/bash\n\
echo "Starting Ollama..."\n\
ollama serve &\n\
sleep 20\n\
echo "Pulling model..."\n\
ollama pull mistral:latest\n\
echo "Starting Flask..."\n\
exec python app.py' > start.sh && chmod +x start.sh

EXPOSE 5001

CMD ["./start.sh"]
