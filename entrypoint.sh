#!/bin/bash
# Simple entrypoint that bypasses any Railway pre-deploy issues
echo "🚀 DriveSmart Railway Entrypoint"
echo "📁 Working directory: $(pwd)"
echo "📋 Files available: $(ls -la)"
echo "🐍 Starting Python application..."
exec python startup.py
