#!/usr/bin/env python3
import http.server
import socketserver
import os
from pathlib import Path

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        mimetype, encoding = super().guess_type(path)
        if path.endswith('.usdz'):
            return 'model/vnd.usdz+zip', encoding
        return mimetype, encoding
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
            print("\nServer stopped")
