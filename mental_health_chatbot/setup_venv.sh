#!/bin/bash
cd /Users/sikhalimbu/Downloads/finalYear/Chatbot/mental_health_chatbot

echo "Creating virtual environment..."
python3 -m venv .venv

echo "Updating pip in the virtual environment..."
.venv/bin/python3 -m pip install --upgrade pip

echo "Installing core dependencies (torch, transformers, peft)..."
# Using --no-cache-dir to avoid disk space issues if possible
.venv/bin/pip install torch transformers peft accelerate scikit-learn flask flask-cors safetensors

echo "Generating requirements.txt..."
.venv/bin/pip freeze > requirements.txt

echo "Setup complete!"
