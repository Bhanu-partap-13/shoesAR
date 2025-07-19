/**
 * Performance Optimization Module
 * Optimizes AR performance for devices without GPU acceleration
 */

class PerformanceOptimizer {
    constructor(platformDetector) {
        this.platformDetector = platformDetector;
        this.performanceProfile = platformDetector.getPerformanceProfile();
        this.isLowEndDevice = this.performanceProfile === 'low';
        
        // Performance monitoring
        this.frameTimeHistory = [];
        this.maxHistoryLength = 60; // 1 second at 60fps
        this.targetFrameTime = 1000 / (platformDetector.platform.isMobile ? 30 : 60);
        this.adaptiveQuality = true;
        
        // Optimization settings
        this.optimizations = {
            reducedResolution: this.isLowEndDevice,
            skipFrames: this.isLowEndDevice,
            simplifiedShaders: this.isLowEndDevice,
            reducedParticles: this.isLowEndDevice,
            cullingEnabled: true,
            lodEnabled: true,
            textureCompression: true
        };
        
        this.init();
    }
    
    init() {
        this.setupPerformanceMonitoring();
        this.setupAdaptiveQuality();
    }
    
    setupPerformanceMonitoring() {
        // Monitor frame times for adaptive quality
        this.lastFrameTime = performance.now();
        
        setInterval(() => {
            this.analyzePerformance();
        }, 1000); // Analyze every second
    }
    
    setupAdaptiveQuality() {
        if (!this.adaptiveQuality) return;
        
        // Adjust quality based on performance
        setInterval(() => {
            if (this.shouldReduceQuality()) {
                this.reduceQuality();
            } else if (this.shouldIncreaseQuality()) {
                this.increaseQuality();
            }
        }, 5000); // Check every 5 seconds
    }
    
    recordFrameTime() {
        const currentTime = performance.now();
        const frameTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.frameTimeHistory.push(frameTime);
        if (this.frameTimeHistory.length > this.maxHistoryLength) {
            this.frameTimeHistory.shift();
        }
    }
    
    getAverageFrameTime() {
        if (this.frameTimeHistory.length === 0) return this.targetFrameTime;
        
        const sum = this.frameTimeHistory.reduce((a, b) => a + b, 0);
        return sum / this.frameTimeHistory.length;
    }
    
    getCurrentFPS() {
        const avgFrameTime = this.getAverageFrameTime();
        return Math.round(1000 / avgFrameTime);
    }
    
    analyzePerformance() {
        const avgFrameTime = this.getAverageFrameTime();
        const fps = this.getCurrentFPS();
        const targetFPS = 1000 / this.targetFrameTime;
        
        console.log(`Performance: ${fps}fps (target: ${targetFPS}fps, avg frame time: ${avgFrameTime.toFixed(2)}ms)`);
        
        // Dispatch performance event
        const event = new CustomEvent('performanceUpdate', {
            detail: {
                fps: fps,
                frameTime: avgFrameTime,
                isPerformant: avgFrameTime < this.targetFrameTime * 1.2
            }
        });
        window.dispatchEvent(event);
    }
    
    shouldReduceQuality() {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime > this.targetFrameTime * 1.5; // 50% slower than target
    }
    
    shouldIncreaseQuality() {
        const avgFrameTime = this.getAverageFrameTime();
        return avgFrameTime < this.targetFrameTime * 0.8; // 20% faster than target
    }
    
    reduceQuality() {
        console.log('Reducing quality due to performance');
        
        // Enable more aggressive optimizations
        this.optimizations.skipFrames = true;
        this.optimizations.reducedResolution = true;
        this.optimizations.simplifiedShaders = true;
        
        // Dispatch quality change event
        this.dispatchQualityChange('reduced');
    }
    
    increaseQuality() {
        if (this.isLowEndDevice) return; // Don't increase on low-end devices
        
        console.log('Increasing quality due to good performance');
        
        // Disable some optimizations
        this.optimizations.skipFrames = false;
        this.optimizations.reducedResolution = false;
        
        this.dispatchQualityChange('increased');
    }
    
    dispatchQualityChange(direction) {
        const event = new CustomEvent('qualityChanged', {
            detail: {
                direction: direction,
                optimizations: { ...this.optimizations }
            }
        });
        window.dispatchEvent(event);
    }
    
    optimizeRenderer(renderer) {
        if (!renderer) return;
        
        // Basic optimizations
        renderer.shadowMap.enabled = !this.isLowEndDevice;
        renderer.antialias = this.performanceProfile === 'high';
        
        // Pixel ratio optimization
        const pixelRatio = this.optimizations.reducedResolution ? 
            Math.min(window.devicePixelRatio, 1.5) : 
            window.devicePixelRatio;
        renderer.setPixelRatio(pixelRatio);
        
        // Power preference
        renderer.powerPreference = this.isLowEndDevice ? 'low-power' : 'default';
        
        console.log(`Renderer optimized for ${this.performanceProfile} performance`);
    }
    
    optimizeScene(scene) {
        if (!scene) return;
        
        scene.traverse((object) => {
            if (object.isMesh) {
                this.optimizeMesh(object);
            } else if (object.isLight) {
                this.optimizeLight(object);
            }
        });
    }
    
    optimizeMesh(mesh) {
        if (!mesh.material) return;
        
        // Simplify materials for low-end devices
        if (this.optimizations.simplifiedShaders) {
            if (mesh.material.isMeshStandardMaterial) {
                // Convert to simpler material
                const simpleMaterial = new THREE.MeshLambertMaterial({
                    color: mesh.material.color,
                    map: mesh.material.map
                });
                mesh.material = simpleMaterial;
            }
        }
        
        // Optimize textures
        if (mesh.material.map) {
            this.optimizeTexture(mesh.material.map);
        }
        
        // Enable frustum culling
        mesh.frustumCulled = this.optimizations.cullingEnabled;
    }
    
    optimizeLight(light) {
        // Reduce shadow quality for performance
        if (light.shadow && this.isLowEndDevice) {
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            light.castShadow = false; // Disable shadows on low-end devices
        }
    }
    
    optimizeTexture(texture) {
        if (!texture) return;
        
        // Reduce texture size for low-end devices
        if (this.optimizations.reducedResolution) {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;
        }
        
        // Enable texture compression if supported
        if (this.optimizations.textureCompression) {
            // This would require actual compressed texture formats
            texture.format = THREE.RGBFormat;
        }
    }
    
    shouldSkipFrame() {
        if (!this.optimizations.skipFrames) return false;
        
        // Skip every other frame on very low-end devices
        return this.isLowEndDevice && (Date.now() % 2 === 0);
    }
    
    optimizeMediaPipeSettings() {
        const settings = {
            modelComplexity: this.isLowEndDevice ? 0 : 1,
            smoothLandmarks: !this.isLowEndDevice,
            minDetectionConfidence: this.isLowEndDevice ? 0.7 : 0.5,
            minTrackingConfidence: this.isLowEndDevice ? 0.7 : 0.5
        };
        
        return settings;
    }
    
    optimizeOpenCVProcessing() {
        return {
            processInterval: this.isLowEndDevice ? 200 : 100, // ms between processing
            imageScale: this.isLowEndDevice ? 0.5 : 1.0,
            enableMorphology: !this.isLowEndDevice,
            contourMinArea: this.isLowEndDevice ? 2000 : 1000
        };
    }
    
    getMemoryUsage() {
        if ('memory' in performance) {
            return {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            };
        }
        return null;
    }
    
    monitorMemoryUsage() {
        const memory = this.getMemoryUsage();
        if (!memory) return;
        
        const usagePercent = (memory.used / memory.limit) * 100;
        
        if (usagePercent > 80) {
            console.warn('High memory usage detected:', usagePercent.toFixed(1) + '%');
            this.triggerGarbageCollection();
        }
    }
    
    triggerGarbageCollection() {
        // Force garbage collection if available (Chrome DevTools)
        if (window.gc) {
            window.gc();
        }
        
        // Dispatch memory warning event
        const event = new CustomEvent('memoryWarning', {
            detail: { usage: this.getMemoryUsage() }
        });
        window.dispatchEvent(event);
    }
    
    getOptimizationReport() {
        return {
            performanceProfile: this.performanceProfile,
            isLowEndDevice: this.isLowEndDevice,
            currentFPS: this.getCurrentFPS(),
            averageFrameTime: this.getAverageFrameTime(),
            optimizations: { ...this.optimizations },
            memoryUsage: this.getMemoryUsage(),
            timestamp: new Date().toISOString()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} else {
    window.PerformanceOptimizer = PerformanceOptimizer;
}
