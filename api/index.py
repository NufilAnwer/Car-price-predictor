"""
Vercel serverless entry point for the Pakistan Car Price Predictor Flask app.
This file bridges Vercel's Python runtime with the Flask application.
"""
import sys
import os

# Add the project root and app directory to the path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_DIR = os.path.join(ROOT_DIR, "app")

sys.path.insert(0, ROOT_DIR)
sys.path.insert(0, APP_DIR)

# Import the Flask app from app/app.py
from app import app

# Vercel expects the WSGI app to be named 'app'
# This is automatically picked up by @vercel/python
