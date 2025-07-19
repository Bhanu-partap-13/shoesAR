#!/bin/bash

echo "========================================"
echo "    Shoe AR Development Server"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed"
    echo "Please install Python from https://python.org"
    exit 1
fi

# Use python3 if available, otherwise python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "Python found:"
$PYTHON_CMD --version

echo
echo "Starting server on http://localhost:8000"
echo
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo

# Change to script directory
cd "$(dirname "$0")"

# Start the Python HTTP server
$PYTHON_CMD -m http.server 8000

echo
echo "Server stopped."
