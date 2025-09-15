# Multi-service Railway Dockerfile for complete DriveSmart deployment
FROM node:18-slim as frontend-build

# Build frontend
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npx expo export --platform web

# Production image with backend + frontend
FROM python:3.11-slim

# Install system dependencies and Ollama
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget ca-certificates nginx \
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
    echo '<!DOCTYPE html><html><head><title>DriveSmart</title></head><body><h1>🚀 DriveSmart Full-Stack Deployment</h1><p>Frontend + Backend + AI powered by Ollama</p><p><a href="/api/health">API Health Check</a></p><p><a href="/api/version">API Version</a></p></body></html>' > /app/static/index.html && \
    echo "⚠️ Created fallback index.html"; \
fi

# Copy state manual text files
COPY frontend/assets/staterules/*.txt ./staterules/

# Create backup requirements path
RUN mkdir -p backend && cp requirements.txt backend/requirements.txt

# Create nginx config for serving frontend and proxying API
RUN echo 'server {\n\
    listen $PORT;\n\
    server_name _;\n\
    \n\
    # Serve frontend static files\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
        root /app/static;\n\
        index index.html;\n\
    }\n\
    \n\
    # Proxy API requests to Flask backend\n\
    location /api/ {\n\
        proxy_pass http://127.0.0.1:5001;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
    \n\
    # Handle auth endpoints\n\
    location /auth/ {\n\
        proxy_pass http://127.0.0.1:5001;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
        proxy_set_header X-Forwarded-Proto $scheme;\n\
    }\n\
}' > /etc/nginx/sites-available/default.template

# Remove default nginx configuration (we'll create it dynamically)
RUN rm -f /etc/nginx/sites-enabled/default

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Final cleanup
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && find /app -name "*.pyc" -delete \
    && find /app -type d -name __pycache__ -exec rm -rf {} +

# Expose default port 80 (Railway will map PORT env var to this)
EXPOSE 80

# Set default port for Railway
ENV PORT=80

CMD ["./entrypoint.sh"]
