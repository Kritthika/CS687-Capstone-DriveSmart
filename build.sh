#!/bin/bash
# Build script for Render deployment

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Setup database (if needed)
python -c "from database import init_db; init_db()"

echo "Backend setup complete!"
