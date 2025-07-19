# Enhanced Shoe AR Application

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
