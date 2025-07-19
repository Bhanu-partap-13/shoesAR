/**
 * Cross-Platform Compatibility Module
 * Detects device capabilities and provides appropriate AR experience
 */

class PlatformDetector {
    constructor() {
        this.userAgent = navigator.userAgent;
        this.platform = this.detectPlatform();
        this.capabilities = this.detectCapabilities();
        this.arSupport = this.detectARSupport();
    }
    
    detectPlatform() {
        const platform = {
            isIOS: /iPhone|iPad|iPod/i.test(this.userAgent),
            isAndroid: /Android/i.test(this.userAgent),
            isMobile: /Mobi|Android/i.test(this.userAgent),
            isTablet: /iPad|Android.*Tablet/i.test(this.userAgent),
            isDesktop: !/Mobi|Android|iPhone|iPad|iPod/i.test(this.userAgent),
            browser: this.detectBrowser(),
            os: this.detectOS()
        };
        
        return platform;
    }
    
    detectBrowser() {
        if (this.userAgent.includes('Chrome') && !this.userAgent.includes('Edg')) {
            return 'chrome';
        } else if (this.userAgent.includes('Firefox')) {
            return 'firefox';
        } else if (this.userAgent.includes('Safari') && !this.userAgent.includes('Chrome')) {
            return 'safari';
        } else if (this.userAgent.includes('Edg')) {
            return 'edge';
        }
        return 'unknown';
    }
    
    detectOS() {
        if (this.platform.isIOS) return 'ios';
        if (this.platform.isAndroid) return 'android';
        if (this.userAgent.includes('Windows')) return 'windows';
        if (this.userAgent.includes('Mac')) return 'macos';
        if (this.userAgent.includes('Linux')) return 'linux';
        return 'unknown';
    }
    
    detectCapabilities() {
        return {
            webgl: this.hasWebGL(),
            webgl2: this.hasWebGL2(),
            webxr: this.hasWebXR(),
            mediaDevices: this.hasMediaDevices(),
            deviceMotion: this.hasDeviceMotion(),
            deviceOrientation: this.hasDeviceOrientation(),
            touchSupport: this.hasTouchSupport(),
            accelerometer: this.hasAccelerometer(),
            gyroscope: this.hasGyroscope()
        };
    }
    
    detectARSupport() {
        const support = {
            webxr: false,
            arcore: false,
            arkit: false,
            quicklook: false,
            sceneviewer: false,
            modelviewer: false
        };
        
        // WebXR support
        if ('xr' in navigator) {
            support.webxr = true;
        }
        
        // iOS AR Quick Look
        if (this.platform.isIOS && this.platform.browser === 'safari') {
            support.arkit = true;
            support.quicklook = true;
        }
        
        // Android ARCore
        if (this.platform.isAndroid && this.platform.browser === 'chrome') {
            support.arcore = true;
            support.sceneviewer = true;
        }
        
        // Model Viewer support
        support.modelviewer = this.hasModelViewerSupport();
        
        return support;
    }
    
    hasWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }
    
    hasWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!canvas.getContext('webgl2');
        } catch (e) {
            return false;
        }
    }
    
    hasWebXR() {
        return 'xr' in navigator && 'requestSession' in navigator.xr;
    }
    
    hasMediaDevices() {
        return 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    }
    
    hasDeviceMotion() {
        return 'DeviceMotionEvent' in window;
    }
    
    hasDeviceOrientation() {
        return 'DeviceOrientationEvent' in window;
    }
    
    hasTouchSupport() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    hasAccelerometer() {
        return 'Accelerometer' in window;
    }
    
    hasGyroscope() {
        return 'Gyroscope' in window;
    }
    
    hasModelViewerSupport() {
        return 'customElements' in window && 'shadowRoot' in Element.prototype;
    }
    
    getRecommendedARMode() {
        // Return the best AR mode for this platform
        if (this.platform.isIOS && this.arSupport.quicklook) {
            return 'quicklook';
        }
        
        if (this.platform.isAndroid && this.arSupport.sceneviewer) {
            return 'sceneviewer';
        }
        
        if (this.arSupport.webxr) {
            return 'webxr';
        }
        
        if (this.arSupport.modelviewer) {
            return 'modelviewer';
        }
        
        if (this.capabilities.webgl && this.capabilities.mediaDevices) {
            return 'webcam';
        }
        
        return 'fallback';
    }
    
    getPerformanceProfile() {
        // Estimate device performance for quality settings
        const gpu = this.getGPUInfo();
        const memory = navigator.deviceMemory || 4; // Default to 4GB if unknown
        
        let profile = 'medium';
        
        if (this.platform.isDesktop) {
            profile = 'high';
        } else if (this.platform.isTablet) {
            profile = 'medium';
        } else if (this.platform.isMobile) {
            // Mobile performance estimation
            if (memory >= 6 && gpu.tier >= 2) {
                profile = 'high';
            } else if (memory >= 3 && gpu.tier >= 1) {
                profile = 'medium';
            } else {
                profile = 'low';
            }
        }
        
        return profile;
    }
    
    getGPUInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return { vendor: 'unknown', renderer: 'unknown', tier: 0 };
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
        
        // Simple GPU tier estimation
        let tier = 1;
        if (renderer.includes('Adreno') || renderer.includes('Mali') || renderer.includes('PowerVR')) {
            tier = renderer.includes('6') || renderer.includes('7') || renderer.includes('8') ? 2 : 1;
        } else if (renderer.includes('Intel')) {
            tier = 1;
        } else if (renderer.includes('NVIDIA') || renderer.includes('AMD')) {
            tier = 3;
        }
        
        return { vendor, renderer, tier };
    }
    
    getOptimalSettings() {
        const performance = this.getPerformanceProfile();
        const arMode = this.getRecommendedARMode();
        
        const settings = {
            quality: performance,
            arMode: arMode,
            enableShadows: performance !== 'low',
            enableAntialiasing: performance === 'high',
            maxTextureSize: performance === 'high' ? 1024 : performance === 'medium' ? 512 : 256,
            targetFPS: this.platform.isMobile ? 30 : 60,
            enableDraco: this.capabilities.webgl2,
            enableWebXR: this.arSupport.webxr && performance !== 'low'
        };
        
        return settings;
    }
    
    requestPermissions() {
        const permissions = [];
        
        // Camera permission
        if (this.capabilities.mediaDevices) {
            permissions.push(
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(() => ({ camera: 'granted' }))
                    .catch(() => ({ camera: 'denied' }))
            );
        }
        
        // Device motion permission (iOS 13+)
        if (this.platform.isIOS && typeof DeviceMotionEvent.requestPermission === 'function') {
            permissions.push(
                DeviceMotionEvent.requestPermission()
                    .then(response => ({ motion: response }))
                    .catch(() => ({ motion: 'denied' }))
            );
        }
        
        // Device orientation permission (iOS 13+)
        if (this.platform.isIOS && typeof DeviceOrientationEvent.requestPermission === 'function') {
            permissions.push(
                DeviceOrientationEvent.requestPermission()
                    .then(response => ({ orientation: response }))
                    .catch(() => ({ orientation: 'denied' }))
            );
        }
        
        return Promise.allSettled(permissions);
    }
    
    generateCompatibilityReport() {
        return {
            platform: this.platform,
            capabilities: this.capabilities,
            arSupport: this.arSupport,
            recommendedMode: this.getRecommendedARMode(),
            performanceProfile: this.getPerformanceProfile(),
            optimalSettings: this.getOptimalSettings(),
            timestamp: new Date().toISOString()
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlatformDetector;
} else {
    window.PlatformDetector = PlatformDetector;
}
