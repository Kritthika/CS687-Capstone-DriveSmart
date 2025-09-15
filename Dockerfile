# DriveSmart Railway Deployment - Optimized for Size
FROM python:3.11-slim

# Install system dependencies and Ollama in one layer to reduce size
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget ca-certificates \
    && curl -fsSL https://ollama.ai/install.sh | sh \
    && apt-get remove -y curl wget \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python packages
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --no-compile -r requirements.txt \
    && pip cache purge \
    && find /usr/local -type d -name __pycache__ -exec rm -rf {} + \
    && find /usr/local -name "*.pyc" -delete

# Copy all backend code to /app
COPY backend/ ./

# Copy entrypoint script and make executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Copy state manual text files for RAG system (only .txt files to save space)
COPY frontend/assets/staterules/*.txt ./staterules/

# Create a backup requirements.txt in the backend path for Railway pre-deploy
# This prevents the "backend/requirements.txt not found" error
RUN mkdir -p backend && cp requirements.txt backend/requirements.txt

# Final cleanup to reduce image size
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && find /app -name "*.pyc" -delete \
    && find /app -type d -name __pycache__ -exec rm -rf {} +

# Expose Flask port
EXPOSE 5001

# Use entrypoint script for reliable startup
CMD ["./entrypoint.sh"]
