#!/usr/bin/env python3
"""
AgriFriend ML Backend Startup Script
Quick start script for development and testing
"""

import subprocess
import sys
import os
import time
import requests
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 9):
        print("❌ Python 3.9+ is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        sys.exit(1)

def create_directories():
    """Create necessary directories"""
    directories = ["models/saved", "logs", "data"]
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
    print("✅ Directories created")

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting AgriFriend ML Backend...")
    print("📍 Server will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("\n" + "="*50)
    
    try:
        # Start uvicorn server
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload",
            "--log-level", "info"
        ])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {str(e)}")

def test_api():
    """Test API endpoints"""
    print("🧪 Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check failed: {str(e)}")
        return False
    
    # Test price prediction
    try:
        payload = {
            "commodity": "Wheat",
            "state": "Punjab",
            "district": "Ludhiana",
            "days_ahead": 7
        }
        response = requests.post(f"{base_url}/predict/price", json=payload, timeout=10)
        if response.status_code == 200:
            print("✅ Price prediction test passed")
        else:
            print(f"❌ Price prediction test failed: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Price prediction test failed: {str(e)}")
    
    return True

def main():
    """Main startup function"""
    print("🌾 AgriFriend ML Backend Startup")
    print("="*40)
    
    # Check Python version
    check_python_version()
    
    # Create directories
    create_directories()
    
    # Install dependencies
    if "--install" in sys.argv or not Path("requirements.txt").exists():
        install_dependencies()
    
    # Test mode
    if "--test" in sys.argv:
        print("🧪 Running in test mode...")
        # Start server in background for testing
        import threading
        server_thread = threading.Thread(target=start_server, daemon=True)
        server_thread.start()
        
        # Wait for server to start
        time.sleep(5)
        
        # Run tests
        test_api()
        return
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()