#!/usr/bin/env python3
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
