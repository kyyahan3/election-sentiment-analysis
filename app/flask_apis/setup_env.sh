#!/bin/bash
# setup_env.sh

# Set the FLASK_APP environment variable
export FLASK_APP=index

# Enable development mode for debug features and auto-reload
export FLASK_ENV=development

echo "Environment variables set:"
echo "FLASK_APP=$FLASK_APP"
echo "FLASK_ENV=$FLASK_ENV"