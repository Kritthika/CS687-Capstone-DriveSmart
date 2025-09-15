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

# Copy state manual text files
COPY frontend/assets/staterules/*.txt ./staterules/

# Create backup requirements path
RUN mkdir -p backend && cp requirements.txt backend/requirements.txt

# Create nginx config for serving frontend
RUN echo 'server {\n\
    listen 80;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
        root /app/static;\n\
    }\n\
    location /api/ {\n\
        proxy_pass http://127.0.0.1:5001;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
    }\n\
}' > /etc/nginx/sites-available/default

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Final cleanup
RUN apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    && find /app -name "*.pyc" -delete \
    && find /app -type d -name __pycache__ -exec rm -rf {} +

EXPOSE 80

CMD ["./entrypoint.sh"]
