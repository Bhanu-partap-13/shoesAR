/**
 * Mobile AR Experience - Optimized for QR Code Scanning
 * Provides enhanced tracking and AR experience specifically for mobile devices
 */

class MobileShoeAR {
    constructor() {
        this.video = document.getElementById('videoInput');
        this.canvas = document.getElementById('canvasAR');
        this.ctx = this.canvas.getContext('2d');
        this.threeContainer = document.getElementById('threejs-canvas');
        
        // Mobile-specific optimizations
        this.isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        this.isAndroid = /Android/i.test(navigator.userAgent);
        
        // Get URL parameters
        this.urlParams = new URLSearchParams(window.location.search);
        this.modelId = this.urlParams.get('id') || '1';
        this.modelUrl = this.urlParams.get('model') || `models/${this.modelId}.glb`;
        this.trackingEnabled = this.urlParams.get('tracking') === 'true';
        
        // Platform detection and optimization (with fallbacks)
        try {
            this.platformDetector = typeof PlatformDetector !== 'undefined' ? new PlatformDetector() : null;
            this.performanceOptimizer = this.platformDetector && typeof PerformanceOptimizer !== 'undefined' ?
                new PerformanceOptimizer(this.platformDetector) : null;
        } catch (error) {
            console.warn('Platform detection failed, using fallbacks:', error);
            this.platformDetector = null;
            this.performanceOptimizer = null;
        }
        
        // Mobile-optimized settings
        this.mobileSettings = {
            videoConstraints: {
                video: {
                    facingMode: 'environment', // Back camera
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 480, max: 720 },
                    frameRate: { ideal: 30, max: 30 }
                }
            },
            trackingInterval: 100, // ms between tracking updates
            renderQuality: (this.performanceOptimizer && this.performanceOptimizer.isLowEndDevice) ? 'low' : 'medium'
        };
        
        // Tracking components
        this.pose = null;
        this.camera = null;
        this.isTracking = this.trackingEnabled;
        this.trackingData = {
            footPosition: null,
            confidence: 0,
            lastUpdate: 0
        };
        
        // Three.js components
        this.renderer = null;
        this.scene = null;
        this.camera3d = null;
        this.shoeModel = null;
        this.modelManager = null;
        
        // Performance monitoring
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        
        this.init();
    }
    
    async init() {
        try {
            // Check if we're actually on a mobile device
            if (!this.isMobile) {
                this.showError('This page is optimized for mobile devices. Please scan the QR code with your phone.');
                return;
            }

            // Check for required APIs
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showError('Camera access is not supported in this browser.');
                return;
            }

            // Request permissions first
            await this.requestMobilePermissions();

            // Initialize components
            await this.setupMobileCamera();
            await this.setupMediaPipeTracking();
            await this.setupThreeJS();
            this.setupMobileControls();
            this.setupTouchHandling();

            // Start the AR experience
            this.startMobileAR();
            this.hideLoading();

        } catch (error) {
            console.error('Mobile AR initialization failed:', error);
            this.showError(`Failed to start AR experience: ${error.message}`);
        }
    }
    
    async requestMobilePermissions() {
        // Camera permission
        try {
            const stream = await navigator.mediaDevices.getUserMedia(this.mobileSettings.videoConstraints);
            stream.getTracks().forEach(track => track.stop()); // Stop test stream
        } catch (error) {
            throw new Error('Camera permission required for AR experience');
        }
        
        // iOS motion permissions
        if (this.isIOS && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceMotionEvent.requestPermission();
                if (permission !== 'granted') {
                    console.warn('Device motion permission denied');
                }
            } catch (error) {
                console.warn('Could not request device motion permission:', error);
            }
        }
    }
    
    async setupMobileCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(this.mobileSettings.videoConstraints);
            this.video.srcObject = stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.resizeMobileCanvas();
                    resolve();
                };
            });
        } catch (error) {
            throw new Error('Failed to access camera: ' + error.message);
        }
    }
    
    resizeMobileCanvas() {
        // Set canvas size to match video
        const rect = this.video.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update Three.js renderer
        if (this.renderer) {
            this.renderer.setSize(rect.width, rect.height);
            this.camera3d.aspect = rect.width / rect.height;
            this.camera3d.updateProjectionMatrix();
        }
    }
    
    async setupMediaPipeTracking() {
        if (!this.isTracking) return;
        
        // Initialize MediaPipe Pose for mobile
        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        
        // Mobile-optimized settings
        this.pose.setOptions({
            modelComplexity: this.performanceOptimizer.isLowEndDevice ? 0 : 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });
        
        this.pose.onResults((results) => this.onMobilePoseResults(results));
        
        // Setup camera for MediaPipe
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                if (this.isTracking && Date.now() - this.trackingData.lastUpdate > this.mobileSettings.trackingInterval) {
                    await this.pose.send({ image: this.video });
                    this.trackingData.lastUpdate = Date.now();
                }
            },
            width: 640,
            height: 480
        });
    }
    
    async setupThreeJS() {
        // Mobile-optimized renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false, // Disabled for mobile performance
            powerPreference: "low-power"
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio
        this.threeContainer.appendChild(this.renderer.domElement);
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera3d = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera3d.position.set(0, 0, 2);
        
        // Mobile-optimized lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
        
        // Initialize model manager and load model
        try {
            this.modelManager = typeof ModelManager !== 'undefined' ? new ModelManager() : null;
            await this.loadMobileModel();
        } catch (error) {
            console.warn('ModelManager not available, using fallback loading:', error);
            this.modelManager = null;
            await this.loadMobileModelFallback();
        }
    }
    
    async loadMobileModel() {
        try {
            if (this.modelManager) {
                this.shoeModel = await this.modelManager.loadModel(this.modelId);
            } else {
                await this.loadMobileModelFallback();
                return;
            }

            // Mobile-optimized model settings
            this.shoeModel.scale.set(0.25, 0.25, 0.25); // Smaller for mobile
            this.shoeModel.position.set(0, -0.3, 0);

            this.scene.add(this.shoeModel);
            this.updateStatus('Model loaded successfully');

        } catch (error) {
            console.error('Failed to load model:', error);
            if (this.modelManager) {
                this.shoeModel = this.modelManager.getFallbackModel(this.modelId);
                this.scene.add(this.shoeModel);
                this.updateStatus('Using fallback model');
            } else {
                await this.loadMobileModelFallback();
            }
        }
    }

    async loadMobileModelFallback() {
        try {
            // Direct GLTFLoader fallback
            const loader = new THREE.GLTFLoader();
            const modelPath = this.modelUrl || `models/${this.modelId}.glb`;

            const gltf = await new Promise((resolve, reject) => {
                loader.load(modelPath, resolve, undefined, reject);
            });

            this.shoeModel = gltf.scene;
            this.shoeModel.scale.set(0.25, 0.25, 0.25);
            this.shoeModel.position.set(0, -0.3, 0);

            this.scene.add(this.shoeModel);
            this.updateStatus('Model loaded (fallback)');

        } catch (error) {
            console.error('Fallback model loading failed:', error);
            this.createSimpleFallbackModel();
        }
    }

    createSimpleFallbackModel() {
        // Create a simple shoe-like shape as last resort
        const shoeGroup = new THREE.Group();

        // Sole
        const soleGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.2);
        const soleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const sole = new THREE.Mesh(soleGeometry, soleMaterial);
        sole.position.y = -0.025;
        shoeGroup.add(sole);

        // Upper part
        const upperGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.18);
        const upperMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const upper = new THREE.Mesh(upperGeometry, upperMaterial);
        upper.position.y = 0.05;
        upper.position.z = -0.01;
        shoeGroup.add(upper);

        this.shoeModel = shoeGroup;
        this.shoeModel.position.set(0, -0.3, 0);
        this.scene.add(this.shoeModel);
        this.updateStatus('Using simple fallback model');
    }
    
    onMobilePoseResults(results) {
        if (!results.poseLandmarks) return;
        
        // Extract foot landmarks
        const leftAnkle = results.poseLandmarks[27];
        const rightAnkle = results.poseLandmarks[28];
        const leftFoot = results.poseLandmarks[31];
        const rightFoot = results.poseLandmarks[32];
        
        if (leftAnkle && rightAnkle && leftFoot && rightFoot) {
            this.updateFootTracking(leftAnkle, rightAnkle, leftFoot, rightFoot);
            this.trackingData.confidence = Math.min(
                leftAnkle.visibility, rightAnkle.visibility,
                leftFoot.visibility, rightFoot.visibility
            );
            
            // Show tracking indicator
            this.showTrackingIndicator(true);
        } else {
            this.showTrackingIndicator(false);
        }
        
        // Draw tracking overlay
        this.drawMobileTrackingOverlay(results);
    }
    
    updateFootTracking(leftAnkle, rightAnkle, leftFoot, rightFoot) {
        // Calculate foot center position
        const centerX = (leftFoot.x + rightFoot.x) / 2;
        const centerY = (leftFoot.y + rightFoot.y) / 2;
        const centerZ = (leftFoot.z + rightFoot.z) / 2;
        
        // Convert to 3D coordinates
        const x = (centerX - 0.5) * 3;
        const y = -(centerY - 0.5) * 2;
        const z = centerZ * 1.5;
        
        this.trackingData.footPosition = { x, y, z };
        
        // Update shoe model position
        if (this.shoeModel && this.trackingData.confidence > 0.5) {
            this.shoeModel.position.x = x;
            this.shoeModel.position.y = y - 0.2;
            this.shoeModel.position.z = z;
            
            // Calculate rotation
            const footAngle = Math.atan2(rightFoot.y - leftFoot.y, rightFoot.x - leftFoot.x);
            this.shoeModel.rotation.y = footAngle;
        }
    }
    
    drawMobileTrackingOverlay(results) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (results.poseLandmarks && this.isTracking) {
            // Draw foot landmarks
            const footLandmarks = [27, 28, 31, 32];
            footLandmarks.forEach(index => {
                const landmark = results.poseLandmarks[index];
                if (landmark && landmark.visibility > 0.5) {
                    const x = landmark.x * this.canvas.width;
                    const y = landmark.y * this.canvas.height;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
                    this.ctx.fillStyle = '#4CAF50';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#2E7D32';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            });
            
            // Draw foot tracking box if confident
            if (this.trackingData.confidence > 0.5) {
                const leftFoot = results.poseLandmarks[31];
                const rightFoot = results.poseLandmarks[32];
                
                if (leftFoot && rightFoot) {
                    const centerX = ((leftFoot.x + rightFoot.x) / 2) * this.canvas.width;
                    const centerY = ((leftFoot.y + rightFoot.y) / 2) * this.canvas.height;
                    const width = Math.abs(rightFoot.x - leftFoot.x) * this.canvas.width * 1.5;
                    const height = width * 0.6;
                    
                    this.ctx.strokeStyle = '#4CAF50';
                    this.ctx.lineWidth = 3;
                    this.ctx.strokeRect(centerX - width/2, centerY - height/2, width, height);
                }
            }
        }
    }
    
    setupMobileControls() {
        // Switch model button
        document.getElementById('switchModelMobile').addEventListener('click', () => {
            this.switchToNextModel();
        });
        
        // Capture photo button
        document.getElementById('capturePhoto').addEventListener('click', () => {
            this.captureARPhoto();
        });
        
        // Toggle tracking button
        document.getElementById('toggleTracking').addEventListener('click', (e) => {
            this.isTracking = !this.isTracking;
            e.target.classList.toggle('active', this.isTracking);
            e.target.textContent = this.isTracking ? 'Track' : 'Paused';
            this.updateStatus(this.isTracking ? 'Tracking enabled' : 'Tracking paused');
        });
        
        // Reset position button
        document.getElementById('resetPosition').addEventListener('click', () => {
            if (this.shoeModel) {
                this.shoeModel.position.set(0, -0.3, 0);
                this.shoeModel.rotation.set(0, 0, 0);
                this.updateStatus('Position reset');
            }
        });
    }
    
    setupTouchHandling() {
        // Prevent default touch behaviors
        document.addEventListener('touchstart', (e) => {
            if (e.target.tagName !== 'BUTTON') {
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.resizeMobileCanvas();
            }, 100);
        });
    }
    
    async switchToNextModel() {
        const availableModels = ['1', '2', '3'];
        const currentIndex = availableModels.indexOf(this.modelId);
        const nextIndex = (currentIndex + 1) % availableModels.length;
        const nextModelId = availableModels[nextIndex];
        
        try {
            if (this.shoeModel) {
                this.scene.remove(this.shoeModel);
            }
            
            this.shoeModel = await this.modelManager.loadModel(nextModelId);
            this.shoeModel.scale.set(0.25, 0.25, 0.25);
            this.shoeModel.position.set(0, -0.3, 0);
            this.scene.add(this.shoeModel);
            
            this.modelId = nextModelId;
            this.updateStatus(`Switched to model ${nextModelId}`);
            
        } catch (error) {
            console.error('Failed to switch model:', error);
            this.updateStatus('Failed to switch model');
        }
    }
    
    captureARPhoto() {
        // Create a temporary canvas to capture the AR scene
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = this.canvas.width;
        captureCanvas.height = this.canvas.height;
        const captureCtx = captureCanvas.getContext('2d');
        
        // Draw video background
        captureCtx.drawImage(this.video, 0, 0, captureCanvas.width, captureCanvas.height);
        
        // Draw tracking overlay
        captureCtx.drawImage(this.canvas, 0, 0);
        
        // Convert to blob and trigger download
        captureCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `shoe-ar-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.updateStatus('Photo captured!');
        });
    }
    
    startMobileAR() {
        if (this.camera && this.isTracking) {
            this.camera.start();
        }
        this.animate();
        this.updateStatus('AR experience started');
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Performance monitoring
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            document.getElementById('fps-mobile').textContent = `${this.fps} FPS`;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        
        // Render 3D scene
        if (this.renderer && this.scene && this.camera3d) {
            this.renderer.render(this.scene, this.camera3d);
        }
    }
    
    showTrackingIndicator(show) {
        const indicator = document.getElementById('tracking-indicator');
        indicator.style.display = show ? 'block' : 'none';
    }
    
    updateStatus(message) {
        document.getElementById('tracking-status-mobile').textContent = message;
    }
    
    hideLoading() {
        const loading = document.getElementById('loading-mobile');
        if (loading) {
            loading.style.display = 'none';
        }
    }
    
    showError(message) {
        const loading = document.getElementById('loading-mobile');
        if (loading) {
            loading.innerHTML = `
                <div style="color: #f44336;">
                    <h3>❌ Error</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 20px;
                        margin-top: 15px;
                        cursor: pointer;
                    ">Try Again</button>
                </div>
            `;
        }
    }
}

// Initialize mobile AR when page loads
window.addEventListener('DOMContentLoaded', () => {
    // Only initialize on mobile devices
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        new MobileShoeAR();
    } else {
        // Desktop fallback - redirect to main page
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #000;
                color: white;
                text-align: center;
                font-family: Arial, sans-serif;
            ">
                <div>
                    <h2>📱 Mobile AR Experience</h2>
                    <p>This page is optimized for mobile devices.</p>
                    <p>Please scan the QR code with your phone to access the AR experience.</p>
                    <button onclick="window.location.href='index.html'" style="
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        font-size: 16px;
                        margin-top: 20px;
                        cursor: pointer;
                    ">← Back to Main Page</button>
                </div>
            </div>
        `;
    }
});
