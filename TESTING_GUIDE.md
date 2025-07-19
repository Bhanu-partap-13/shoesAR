# Enhanced Shoe AR - Testing Guide

## Quick Start Testing

### 1. Start the Development Server
```bash
python scripts/server.py
```
Server will be available at: http://localhost:8000

### 2. Test Basic Functionality
1. Open http://localhost:8000 in your browser
2. Navigate to the AR experience
3. Allow camera permissions when prompted
4. Verify video feed is working

## Testing Checklist

### ✅ Core AR Functionality
- [ ] Camera access and video feed display
- [ ] MediaPipe pose detection initialization
- [ ] 3D model loading and rendering
- [ ] Basic foot tracking and model positioning
- [ ] Frame rate monitoring (should show FPS counter)

### ✅ Cross-Platform Compatibility

#### Desktop Testing
- [ ] Chrome/Chromium (recommended)
- [ ] Firefox (limited MediaPipe support expected)
- [ ] Edge (basic support)
- [ ] Safari (macOS)

#### Mobile Testing
- [ ] **iOS Safari**: Should redirect to AR Quick Look
- [ ] **Android Chrome**: Should offer Scene Viewer option
- [ ] **Mobile Web**: Fallback to camera-based tracking

### ✅ Performance Optimization
- [ ] Quality settings adjustment (High/Medium/Low)
- [ ] Frame rate maintains target (30fps mobile, 60fps desktop)
- [ ] Memory usage stays reasonable
- [ ] Adaptive quality changes based on performance

### ✅ Advanced Features
- [ ] Foot size estimation display
- [ ] Fitting analysis recommendations
- [ ] Lighting adaptation
- [ ] Model switching functionality
- [ ] WebXR support (if available)

### ✅ Error Handling
- [ ] Camera permission denied gracefully handled
- [ ] Model loading failures show fallback
- [ ] MediaPipe initialization errors handled
- [ ] Network connectivity issues handled

## Device-Specific Testing

### Low-End Devices
- Verify "Low" quality setting is automatically selected
- Check that frame skipping occurs when needed
- Ensure simplified shaders are used
- Confirm reduced resolution processing

### High-End Devices
- Verify "High" quality setting is available
- Check that shadows and antialiasing are enabled
- Ensure full resolution processing
- Confirm WebXR support if available

### Mobile Devices
- Test portrait and landscape orientations
- Verify touch controls work properly
- Check that device motion permissions are requested (iOS)
- Test camera switching (front/back)

## Feature Testing

### 1. Model Management
```javascript
// Test model switching
document.getElementById('switchModel').click();

// Check model info
console.log(arInstance.modelManager.getAllModelsInfo());
```

### 2. Performance Monitoring
```javascript
// Check performance report
console.log(arInstance.performanceOptimizer.getOptimizationReport());

// Monitor frame times
window.addEventListener('performanceUpdate', (e) => {
    console.log('Performance:', e.detail);
});
```

### 3. Platform Detection
```javascript
// Check platform capabilities
console.log(arInstance.platformDetector.generateCompatibilityReport());
```

## Common Issues and Solutions

### Issue: Camera not working
**Solutions:**
- Check browser permissions
- Try HTTPS instead of HTTP
- Restart browser
- Check if camera is used by another application

### Issue: Models not loading
**Solutions:**
- Check network connectivity
- Verify model files exist in `/models/` directory
- Check browser console for errors
- Try fallback model

### Issue: Poor performance
**Solutions:**
- Lower quality settings
- Close other browser tabs
- Check device specifications
- Enable hardware acceleration in browser

### Issue: Tracking not working
**Solutions:**
- Ensure good lighting conditions
- Check MediaPipe initialization
- Verify pose detection is working
- Try different camera angles

## Performance Benchmarks

### Target Performance Metrics
- **Desktop**: 60 FPS, <50ms frame time
- **Mobile**: 30 FPS, <33ms frame time
- **Memory**: <200MB total usage
- **Model Loading**: <3 seconds per model

### Quality Settings Impact
- **High**: Full resolution, shadows, antialiasing
- **Medium**: Reduced resolution, basic lighting
- **Low**: Minimal resolution, simplified rendering

## Browser Compatibility Matrix

| Browser | Desktop | Mobile | WebXR | MediaPipe | Notes |
|---------|---------|--------|-------|-----------|-------|
| Chrome | ✅ Full | ✅ Full | ✅ Yes | ✅ Yes | Recommended |
| Firefox | ⚠️ Limited | ⚠️ Limited | ❌ No | ⚠️ Partial | Basic support |
| Safari | ✅ Good | ✅ AR Quick Look | ❌ No | ❌ No | iOS native AR |
| Edge | ✅ Good | ⚠️ Limited | ⚠️ Partial | ✅ Yes | Similar to Chrome |

## Testing URLs

### Main Application
- http://localhost:8000 - Main product page
- http://localhost:8000/ar.html - Enhanced AR experience
- http://localhost:8000/3dview.html - 3D model viewer

### Testing with Parameters
- http://localhost:8000/ar.html?model=models/1.glb - Specific model
- http://localhost:8000/product.html?id=1 - Product page

## Automated Testing

### Performance Testing Script
```javascript
// Run in browser console
function runPerformanceTest() {
    const startTime = performance.now();
    let frameCount = 0;
    
    function measureFrame() {
        frameCount++;
        if (frameCount < 300) { // Test for 5 seconds at 60fps
            requestAnimationFrame(measureFrame);
        } else {
            const endTime = performance.now();
            const avgFPS = (frameCount * 1000) / (endTime - startTime);
            console.log(`Average FPS: ${avgFPS.toFixed(2)}`);
        }
    }
    
    requestAnimationFrame(measureFrame);
}

runPerformanceTest();
```

### Feature Testing Script
```javascript
// Test all major features
function runFeatureTest() {
    const tests = [
        () => typeof EnhancedShoeAR !== 'undefined',
        () => typeof ModelManager !== 'undefined',
        () => typeof PlatformDetector !== 'undefined',
        () => typeof PerformanceOptimizer !== 'undefined',
        () => typeof ARFeatures !== 'undefined'
    ];
    
    tests.forEach((test, index) => {
        console.log(`Test ${index + 1}: ${test() ? 'PASS' : 'FAIL'}`);
    });
}

runFeatureTest();
```

## Deployment Testing

### Before Deployment
- [ ] All models load correctly
- [ ] HTTPS compatibility verified
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility confirmed
- [ ] Performance benchmarks met

### Production Environment
- [ ] CDN resources load properly
- [ ] CORS headers configured correctly
- [ ] SSL certificate valid
- [ ] Mobile app integration tested
- [ ] Analytics tracking working

## Troubleshooting Commands

```bash
# Check server status
curl http://localhost:8000

# Test model files
ls -la models/

# Check Python server logs
python scripts/server.py

# Optimize models
python scripts/optimize.py
```

## Support Information

For issues or questions:
1. Check browser console for errors
2. Verify device compatibility
3. Test with different models
4. Check network connectivity
5. Review this testing guide

Remember to test on actual mobile devices for the most accurate results!
