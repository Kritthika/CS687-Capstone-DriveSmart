# Simplified Railway Dockerfile - Flask serves everything
FROM node:18-slim as frontend-build

# Build frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npx expo export --platform web

# Production image with backend + frontend
FROM python:3.11-slim

# Install system dependencies and Ollama (no nginx needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget ca-certificates \
    && curl -fsSL https://ollama.ai/install.sh | sh \
    && apt-get remove -y curl wget \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Set working directory
WORKDIR /app

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --no-compile -r requirements.txt \
    && pip cache purge \
    && find /usr/local -type d -name __pycache__ -exec rm -rf {} + \
    && find /usr/local -name "*.pyc" -delete

# Copy backend code
COPY backend/ ./

# Copy frontend build from previous stage
COPY --from=frontend-build /frontend/dist /app/static

# Verify frontend files were copied
RUN ls -la /app/static/ && echo "✅ Frontend files copied successfully"

# Create fallback index.html if frontend build failed
RUN if [ ! -f /app/static/index.html ]; then \
    mkdir -p /app/static && \
    echo '<!DOCTYPE html><html><head><title>DriveSmart API</title></head><body><h1>🚀 DriveSmart Railway Deployment</h1><p>Flask Backend + AI powered by Ollama</p><p><a href="/api/health">API Health Check</a></p><p><a href="/api/version">API Version</a></p></body></html>' > /app/static/index.html && \
    echo "⚠️ Created fallback index.html"; \
fi

# Copy state manual text files
COPY frontend/assets/staterules/*.txt ./staterules/

# Final cleanup
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && find /app -name "*.pyc" -delete \
    && find /app -type d -name __pycache__ -exec rm -rf {} +

# Expose default port (Railway will assign PORT env var)
EXPOSE 8080

# Set default port for Railway
ENV PORT=8080

# Start Flask directly (no nginx needed)
CMD ["python", "startup.py"]
