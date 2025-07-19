class EnhancedShoeAR {
    constructor() {
        this.video = document.getElementById('videoInput');
        this.canvas = document.getElementById('canvasAR');
        this.ctx = this.canvas.getContext('2d');
        this.threeContainer = document.getElementById('threejs-canvas');

        // Platform detection and performance optimization
        this.platformDetector = new PlatformDetector();
        this.optimalSettings = this.platformDetector.getOptimalSettings();
        this.performanceOptimizer = new PerformanceOptimizer(this.platformDetector);

        // MediaPipe instances
        this.pose = null;
        this.hands = null;
        this.camera = null;

        // Three.js components
        this.renderer = null;
        this.scene = null;
        this.camera3d = null;
        this.shoeModel = null;
        this.currentModelIndex = 0;
        this.availableModels = ['1.glb', '2.glb', '3.glb'];

        // WebXR support
        this.xrSession = null;
        this.xrReferenceSpace = null;
        this.isXRSupported = false;

        // Tracking state
        this.isTracking = true;
        this.trackingData = {
            pose: null,
            hands: null,
            footPosition: null,
            confidence: 0
        };

        // Performance monitoring
        this.fps = 0;
        this.lastTime = performance.now();
        this.frameCount = 0;

        // Quality settings based on platform
        this.qualitySettings = {
            high: { width: 1280, height: 720, modelComplexity: 2 },
            medium: { width: 640, height: 480, modelComplexity: 1 },
            low: { width: 320, height: 240, modelComplexity: 0 }
        };
        this.currentQuality = this.optimalSettings.quality;

        this.init();
    }
    
    async init() {
        try {
            // Check for WebXR support first
            await this.checkWebXRSupport();

            // Request necessary permissions
            await this.requestPermissions();

            await this.setupCamera();
            await this.setupMediaPipe();
            await this.setupThreeJS();
            this.setupEventListeners();
            this.hideLoading();
            this.startTracking();

            // Display platform info
            this.displayPlatformInfo();

        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Failed to initialize AR. Please check camera permissions.');
        }
    }

    async checkWebXRSupport() {
        if ('xr' in navigator) {
            try {
                this.isXRSupported = await navigator.xr.isSessionSupported('immersive-ar');
                if (this.isXRSupported) {
                    console.log('WebXR AR is supported');
                    this.addWebXRButton();
                }
            } catch (error) {
                console.log('WebXR not available:', error);
            }
        }
    }

    async requestPermissions() {
        try {
            const permissions = await this.platformDetector.requestPermissions();
            console.log('Permissions:', permissions);
        } catch (error) {
            console.warn('Permission request failed:', error);
        }
    }

    addWebXRButton() {
        const controls = document.getElementById('controls');
        const xrButton = document.createElement('button');
        xrButton.id = 'enterXR';
        xrButton.className = 'control-button';
        xrButton.textContent = 'Enter AR';
        xrButton.addEventListener('click', () => this.enterXR());
        controls.appendChild(xrButton);
    }

    async enterXR() {
        if (!this.isXRSupported) {
            this.showError('WebXR AR is not supported on this device');
            return;
        }

        try {
            this.xrSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['dom-overlay', 'hit-test']
            });

            await this.setupXRSession();

        } catch (error) {
            console.error('Failed to enter XR:', error);
            this.showError('Failed to start AR session');
        }
    }

    async setupXRSession() {
        // Set up XR reference space
        this.xrReferenceSpace = await this.xrSession.requestReferenceSpace('local');

        // Configure renderer for XR
        await this.renderer.xr.setSession(this.xrSession);
        this.renderer.xr.enabled = true;

        // Handle session end
        this.xrSession.addEventListener('end', () => {
            this.xrSession = null;
            this.xrReferenceSpace = null;
            this.renderer.xr.enabled = false;
        });

        console.log('XR session started');
    }
    
    async setupCamera() {
        const quality = this.qualitySettings[this.currentQuality];
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: quality.width,
                    height: quality.height,
                    facingMode: 'environment' // Prefer back camera
                }
            });
            
            this.video.srcObject = stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.resizeCanvas();
                    resolve();
                };
            });
        } catch (error) {
            console.error('Camera setup failed:', error);
            throw new Error('Camera access denied or not available');
        }
    }
    
    resizeCanvas() {
        const rect = this.video.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        if (this.renderer) {
            this.renderer.setSize(rect.width, rect.height);
            this.camera3d.aspect = rect.width / rect.height;
            this.camera3d.updateProjectionMatrix();
        }
    }
    
    async setupMediaPipe() {
        // Initialize Pose detection
        this.pose = new Pose({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });
        
        // Use optimized MediaPipe settings
        const optimizedSettings = this.performanceOptimizer.optimizeMediaPipeSettings();
        this.pose.setOptions({
            modelComplexity: optimizedSettings.modelComplexity,
            smoothLandmarks: optimizedSettings.smoothLandmarks,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: optimizedSettings.minDetectionConfidence,
            minTrackingConfidence: optimizedSettings.minTrackingConfidence
        });
        
        this.pose.onResults((results) => this.onPoseResults(results));
        
        // Initialize Hand detection
        this.hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });
        
        this.hands.setOptions({
            maxNumHands: this.performanceOptimizer.isLowEndDevice ? 1 : 2,
            modelComplexity: optimizedSettings.modelComplexity,
            minDetectionConfidence: optimizedSettings.minDetectionConfidence,
            minTrackingConfidence: optimizedSettings.minTrackingConfidence
        });
        
        this.hands.onResults((results) => this.onHandResults(results));
        
        // Setup camera for MediaPipe
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                if (this.isTracking) {
                    await this.pose.send({ image: this.video });
                    await this.hands.send({ image: this.video });
                }
            },
            width: this.qualitySettings[this.currentQuality].width,
            height: this.qualitySettings[this.currentQuality].height
        });
    }
    
    async setupThreeJS() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: this.currentQuality === 'high',
            powerPreference: "default" // Use default for better compatibility
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = this.currentQuality !== 'low';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threeContainer.appendChild(this.renderer.domElement);

        // Create scene
        this.scene = new THREE.Scene();

        // Create camera
        this.camera3d = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera3d.position.set(0, 0, 2);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = this.currentQuality !== 'low';
        this.scene.add(directionalLight);

        // Initialize model manager
        this.modelManager = new ModelManager();

        // Initialize advanced AR features
        this.arFeatures = new ARFeatures(this);

        // Load initial model
        await this.loadShoeModel();
    }
    
    async loadShoeModel(modelIndex = 0) {
        try {
            const modelId = (modelIndex + 1).toString(); // Convert to 1-based ID

            // Remove existing model
            if (this.shoeModel) {
                this.scene.remove(this.shoeModel);
            }

            // Load model using model manager
            this.shoeModel = await this.modelManager.loadModel(modelId);
            this.scene.add(this.shoeModel);
            this.currentModelIndex = modelIndex;

            // Update status with model info
            const modelInfo = this.modelManager.getModelInfo(modelId);
            const statusText = modelInfo.isFallback ?
                `Fallback Model (${modelId})` :
                `Model ${modelId} (${modelInfo.triangleCount} triangles)`;

            this.updateStatus('currentModel', statusText);

        } catch (error) {
            console.error('Failed to load model:', error);
            this.createFallbackModel();
        }
    }

    createFallbackModel() {
        // Use model manager's fallback
        if (this.shoeModel) {
            this.scene.remove(this.shoeModel);
        }

        this.shoeModel = this.modelManager.getFallbackModel('fallback');
        this.scene.add(this.shoeModel);
        this.updateStatus('currentModel', 'Emergency Fallback');
    }
    
    onPoseResults(results) {
        this.trackingData.pose = results;

        if (results.poseLandmarks) {
            // Extract foot landmarks (ankles and feet)
            const leftAnkle = results.poseLandmarks[27];
            const rightAnkle = results.poseLandmarks[28];
            const leftFoot = results.poseLandmarks[31];
            const rightFoot = results.poseLandmarks[32];

            // Calculate foot position and orientation
            if (leftAnkle && rightAnkle && leftFoot && rightFoot) {
                this.calculateFootPosition(leftAnkle, rightAnkle, leftFoot, rightFoot);
                this.trackingData.confidence = Math.min(
                    leftAnkle.visibility, rightAnkle.visibility,
                    leftFoot.visibility, rightFoot.visibility
                );

                // Perform foot size estimation
                this.arFeatures.estimateFootSize(results.poseLandmarks);

                // Analyze fitting
                this.arFeatures.analyzeFitting();
            }
        }

        this.drawPoseOverlay(results);
    }
    
    onHandResults(results) {
        this.trackingData.hands = results;
        this.drawHandOverlay(results);
    }
    
    calculateFootPosition(leftAnkle, rightAnkle, leftFoot, rightFoot) {
        // Calculate center point between feet
        const centerX = (leftFoot.x + rightFoot.x) / 2;
        const centerY = (leftFoot.y + rightFoot.y) / 2;
        const centerZ = (leftFoot.z + rightFoot.z) / 2;

        // Convert normalized coordinates to 3D space
        const x = (centerX - 0.5) * 4; // Scale and center
        const y = -(centerY - 0.5) * 3; // Flip Y and scale
        const z = centerZ * 2;

        this.trackingData.footPosition = { x, y, z };

        // Update shoe model position if available
        if (this.shoeModel && this.trackingData.confidence > 0.5) {
            this.shoeModel.position.x = x;
            this.shoeModel.position.y = y - 0.3; // Offset slightly below foot
            this.shoeModel.position.z = z;

            // Calculate rotation based on foot orientation
            const footAngle = Math.atan2(rightFoot.y - leftFoot.y, rightFoot.x - leftFoot.x);
            this.shoeModel.rotation.y = footAngle;
        }
    }

    drawPoseOverlay(results) {
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (results.poseLandmarks) {
            // Draw pose connections
            drawConnectors(this.ctx, results.poseLandmarks, POSE_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });

            // Draw landmarks
            drawLandmarks(this.ctx, results.poseLandmarks, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 2
            });

            // Highlight foot landmarks
            const footLandmarks = [27, 28, 31, 32]; // Ankles and feet
            footLandmarks.forEach(index => {
                const landmark = results.poseLandmarks[index];
                if (landmark) {
                    const x = landmark.x * this.canvas.width;
                    const y = landmark.y * this.canvas.height;

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
                    this.ctx.fillStyle = '#00FFFF';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#0088FF';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
            });
        }

        this.ctx.restore();
    }

    drawHandOverlay(results) {
        if (results.multiHandLandmarks) {
            for (const landmarks of results.multiHandLandmarks) {
                drawConnectors(this.ctx, landmarks, HAND_CONNECTIONS, {
                    color: '#CC0000',
                    lineWidth: 2
                });
                drawLandmarks(this.ctx, landmarks, {
                    color: '#00CC00',
                    lineWidth: 1,
                    radius: 2
                });
            }
        }
    }

    setupEventListeners() {
        // Toggle tracking
        document.getElementById('toggleTracking').addEventListener('click', () => {
            this.isTracking = !this.isTracking;
            this.updateStatus('trackingStatus', this.isTracking ? 'Active' : 'Paused');
        });

        // Switch model
        document.getElementById('switchModel').addEventListener('click', () => {
            const nextIndex = (this.currentModelIndex + 1) % this.availableModels.length;
            this.loadShoeModel(nextIndex);
        });

        // Reset position
        document.getElementById('resetPosition').addEventListener('click', () => {
            if (this.shoeModel) {
                this.shoeModel.position.set(0, -0.5, 0);
                this.shoeModel.rotation.set(0, 0, 0);
            }
        });

        // Quality settings
        document.getElementById('qualitySelect').addEventListener('change', (e) => {
            this.changeQuality(e.target.value);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Handle device orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });
    }

    async changeQuality(newQuality) {
        if (newQuality === this.currentQuality) return;

        this.currentQuality = newQuality;

        // Update MediaPipe settings
        const quality = this.qualitySettings[newQuality];

        if (this.pose) {
            this.pose.setOptions({
                modelComplexity: quality.modelComplexity
            });
        }

        if (this.hands) {
            this.hands.setOptions({
                modelComplexity: quality.modelComplexity
            });
        }

        // Restart camera with new quality
        await this.setupCamera();
    }

    startTracking() {
        this.camera.start();
        this.animate();
        this.updateStatus('trackingStatus', 'Active');
    }

    animate() {
        // Skip frame if performance optimization suggests it
        if (this.performanceOptimizer.shouldSkipFrame()) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        requestAnimationFrame(() => this.animate());

        // Record frame time for performance monitoring
        this.performanceOptimizer.recordFrameTime();

        // Update FPS counter
        this.frameCount++;
        const currentTime = performance.now();
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.performanceOptimizer.getCurrentFPS();
            this.updateStatus('fpsCounter', this.fps);
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Monitor memory usage
            this.performanceOptimizer.monitorMemoryUsage();
        }

        // Render 3D scene
        if (this.renderer && this.scene && this.camera3d) {
            this.renderer.render(this.scene, this.camera3d);
        }
    }

    updateStatus(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.innerHTML = `<h3>Error</h3><p>${message}</p>`;
            loading.style.background = 'rgba(255,0,0,0.8)';
        }
    }

    displayPlatformInfo() {
        const report = this.platformDetector.generateCompatibilityReport();
        console.log('Platform Compatibility Report:', report);

        // Update quality status
        this.updateStatus('qualityStatus', this.currentQuality.charAt(0).toUpperCase() + this.currentQuality.slice(1));

        // Show platform-specific features
        if (report.arSupport.webxr) {
            console.log('WebXR AR supported');
        }
        if (report.arSupport.quicklook) {
            console.log('iOS AR Quick Look supported');
        }
        if (report.arSupport.sceneviewer) {
            console.log('Android Scene Viewer supported');
        }
    }
}

// Initialize the AR application when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Check for required APIs
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera access is not supported in this browser');
        return;
    }

    // Initialize the enhanced AR system
    new EnhancedShoeAR();
});

// Handle iOS-specific requirements
if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // Add iOS-specific handling
    document.addEventListener('touchstart', function() {
        // Enable audio context on iOS after user interaction
        if (typeof AudioContext !== 'undefined') {
            const audioContext = new AudioContext();
            audioContext.resume();
        }
    }, { once: true });
}
}
