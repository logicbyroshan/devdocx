#!/usr/bin/env bash
# exit on error
set -o errexit

# Install project Python dependencies
pip install -r requirements.txt

# Build React Frontend
if [ -d "frontend" ]; then
    echo "Building React Frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Run Django's deployment commands
python manage.py collectstatic --no-input
python manage.py migrate

# Create the superuser if not exists
python manage.py createsu