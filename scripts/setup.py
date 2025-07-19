#!/usr/bin/env python3
"""
Enhanced Shoe AR Setup Script
This script downloads and sets up all required dependencies for the AR application.
"""

import os
import sys
import urllib.request
import json
import subprocess
from pathlib import Path

class ARSetup:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent
        self.models_dir = self.base_dir / "models"
        self.scripts_dir = self.base_dir / "scripts"
        
        # Ensure directories exist
        self.models_dir.mkdir(exist_ok=True)
        self.scripts_dir.mkdir(exist_ok=True)
        
    def print_status(self, message, status="INFO"):
        colors = {
            "INFO": "\033[94m",
            "SUCCESS": "\033[92m",
            "WARNING": "\033[93m",
            "ERROR": "\033[91m",
            "END": "\033[0m"
        }
        print(f"{colors.get(status, '')}{status}: {message}{colors['END']}")
    
    def check_requirements(self):
        """Check if required tools are available"""
        self.print_status("Checking system requirements...")
        
        # Check Python version
        if sys.version_info < (3, 6):
            self.print_status("Python 3.6+ is required", "ERROR")
            return False
            
        # Check if Node.js is available (optional)
        try:
            subprocess.run(["node", "--version"], capture_output=True, check=True)
            self.print_status("Node.js found", "SUCCESS")
        except (subprocess.CalledProcessError, FileNotFoundError):
            self.print_status("Node.js not found (optional for development)", "WARNING")
        
        return True
    
    def download_file(self, url, destination):
        """Download a file with progress indication"""
        try:
            self.print_status(f"Downloading {url}")
            urllib.request.urlretrieve(url, destination)
            self.print_status(f"Downloaded to {destination}", "SUCCESS")
            return True
        except Exception as e:
            self.print_status(f"Failed to download {url}: {e}", "ERROR")
            return False
    
    def setup_models(self):
        """Download sample 3D models if they don't exist"""
        self.print_status("Setting up 3D models...")
        
        # Sample model URLs (replace with actual model URLs)
        sample_models = {
            "1.glb": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
            "2.glb": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb",
            "3.glb": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Sphere/glTF-Binary/Sphere.glb"
        }
        
        for model_name, url in sample_models.items():
            model_path = self.models_dir / model_name
            if not model_path.exists():
                if not self.download_file(url, model_path):
                    self.print_status(f"Creating placeholder for {model_name}", "WARNING")
                    # Create a placeholder file
                    model_path.write_text("# Placeholder - replace with actual GLB model")
    
    def create_usdz_models(self):
        """Create USDZ models for iOS compatibility"""
        self.print_status("Creating USDZ models for iOS...")
        
        # Note: This would require actual USDZ conversion tools
        # For now, we'll create placeholder files
        for i in range(1, 4):
            usdz_path = self.models_dir / f"{i}.usdz"
            if not usdz_path.exists():
                usdz_path.write_text("# USDZ placeholder - convert from GLB using Reality Converter or similar tool")
                self.print_status(f"Created placeholder {usdz_path.name}", "WARNING")
    
    def setup_development_server(self):
        """Set up development server configuration"""
        self.print_status("Setting up development server...")
        
        # Create a simple server script
        server_script = self.scripts_dir / "server.py"
        server_content = '''#!/usr/bin/env python3
import http.server
import socketserver
import os
from pathlib import Path

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

if __name__ == "__main__":
    PORT = 8000
    os.chdir(Path(__file__).parent.parent)
    
    with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print("Press Ctrl+C to stop")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\\nServer stopped")
'''
        server_script.write_text(server_content)
        server_script.chmod(0o755)
        self.print_status("Development server script created", "SUCCESS")
    
    def create_optimization_script(self):
        """Create model optimization script"""
        self.print_status("Creating optimization tools...")
        
        optimize_script = self.scripts_dir / "optimize.py"
        optimize_content = '''#!/usr/bin/env python3
"""
Model optimization script for better performance on mobile devices
"""
import os
import json
from pathlib import Path

def optimize_models():
    models_dir = Path(__file__).parent.parent / "models"
    
    print("Model optimization tips:")
    print("1. Use Draco compression for GLB files")
    print("2. Reduce texture sizes for mobile devices")
    print("3. Simplify geometry for better performance")
    print("4. Use LOD (Level of Detail) models")
    
    for model_file in models_dir.glob("*.glb"):
        size = model_file.stat().st_size
        print(f"{model_file.name}: {size / 1024:.1f} KB")
        
        if size > 1024 * 1024:  # 1MB
            print(f"  WARNING: {model_file.name} is large, consider optimization")

if __name__ == "__main__":
    optimize_models()
'''
        optimize_script.write_text(optimize_content)
        optimize_script.chmod(0o755)
        self.print_status("Optimization script created", "SUCCESS")
    
    def create_readme(self):
        """Create comprehensive README"""
        readme_path = self.base_dir / "README_ENHANCED.md"
        readme_content = '''# Enhanced Shoe AR Application

## Features
- MediaPipe-based foot tracking
- Cross-platform support (iOS, Android, Web)
- Performance optimization for non-GPU devices
- Multiple quality settings
- Improved 3D model management

## Setup Instructions

### 1. Install Dependencies
```bash
python scripts/setup.py
```

### 2. Start Development Server
```bash
python scripts/server.py
```

### 3. Access the Application
Open http://localhost:8000 in your browser

## Browser Compatibility
- Chrome/Chromium (recommended)
- Firefox (limited MediaPipe support)
- Safari (iOS AR Quick Look)
- Edge (basic support)

## Mobile Usage
- **iOS**: Uses AR Quick Look for native AR experience
- **Android**: Uses Scene Viewer with ARCore
- **Web**: Falls back to camera-based tracking

## Performance Tips
- Use "Low" quality setting on older devices
- Ensure good lighting for tracking
- Keep models under 1MB for better loading

## Troubleshooting
- Camera permission denied: Check browser settings
- Models not loading: Verify file paths and formats
- Poor tracking: Improve lighting conditions
'''
        readme_path.write_text(readme_content)
        self.print_status("Enhanced README created", "SUCCESS")
    
    def run_setup(self):
        """Run the complete setup process"""
        self.print_status("Starting Enhanced Shoe AR Setup", "INFO")
        
        if not self.check_requirements():
            return False
        
        self.setup_models()
        self.create_usdz_models()
        self.setup_development_server()
        self.create_optimization_script()
        self.create_readme()
        
        self.print_status("Setup completed successfully!", "SUCCESS")
        self.print_status("Run 'python scripts/server.py' to start the development server", "INFO")
        
        return True

if __name__ == "__main__":
    setup = ARSetup()
    success = setup.run_setup()
    sys.exit(0 if success else 1)
