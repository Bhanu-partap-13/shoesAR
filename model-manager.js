/**
 * Enhanced 3D Model Manager for Shoe AR Application
 * Handles loading, validation, optimization, and management of 3D models
 */

class ModelManager {
    constructor() {
        this.models = new Map();
        this.loadingPromises = new Map();
        this.loader = new THREE.GLTFLoader();
        this.dracoLoader = null;
        this.currentModel = null;
        this.fallbackGeometry = null;
        
        // Model configuration
        this.modelConfig = {
            maxFileSize: 5 * 1024 * 1024, // 5MB
            supportedFormats: ['.glb', '.gltf'],
            defaultScale: { x: 0.3, y: 0.3, z: 0.3 },
            defaultPosition: { x: 0, y: -0.5, z: 0 },
            qualitySettings: {
                high: { maxTriangles: 50000, textureSize: 1024 },
                medium: { maxTriangles: 25000, textureSize: 512 },
                low: { maxTriangles: 10000, textureSize: 256 }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupDracoLoader();
        this.createFallbackGeometry();
        this.preloadModels();
    }
    
    setupDracoLoader() {
        // Setup Draco compression support for better performance
        if (typeof THREE.DRACOLoader !== 'undefined') {
            this.dracoLoader = new THREE.DRACOLoader();
            this.dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
            this.loader.setDRACOLoader(this.dracoLoader);
        }
    }
    
    createFallbackGeometry() {
        // Create fallback shoe-like geometry
        const shoeGroup = new THREE.Group();
        
        // Sole
        const soleGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.4);
        const soleMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const sole = new THREE.Mesh(soleGeometry, soleMaterial);
        sole.position.y = -0.05;
        shoeGroup.add(sole);
        
        // Upper part
        const upperGeometry = new THREE.BoxGeometry(1.0, 0.3, 0.35);
        const upperMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
        const upper = new THREE.Mesh(upperGeometry, upperMaterial);
        upper.position.y = 0.1;
        upper.position.z = -0.05;
        shoeGroup.add(upper);
        
        // Toe cap
        const toeGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const toeMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const toe = new THREE.Mesh(toeGeometry, toeMaterial);
        toe.position.set(0.5, 0.05, 0);
        toe.scale.set(1, 0.8, 0.8);
        shoeGroup.add(toe);
        
        this.fallbackGeometry = shoeGroup;
    }
    
    async preloadModels() {
        // Preload available models
        const modelIds = ['1', '2', '3'];
        const preloadPromises = modelIds.map(id => this.loadModel(id, false));
        
        try {
            await Promise.allSettled(preloadPromises);
            console.log('Model preloading completed');
        } catch (error) {
            console.warn('Some models failed to preload:', error);
        }
    }
    
    async loadModel(modelId, forceReload = false) {
        // Check if model is already loaded
        if (!forceReload && this.models.has(modelId)) {
            return this.models.get(modelId);
        }
        
        // Check if loading is in progress
        if (this.loadingPromises.has(modelId)) {
            return this.loadingPromises.get(modelId);
        }
        
        const loadPromise = this._loadModelInternal(modelId);
        this.loadingPromises.set(modelId, loadPromise);
        
        try {
            const model = await loadPromise;
            this.models.set(modelId, model);
            return model;
        } catch (error) {
            console.error(`Failed to load model ${modelId}:`, error);
            return this.getFallbackModel(modelId);
        } finally {
            this.loadingPromises.delete(modelId);
        }
    }
    
    async _loadModelInternal(modelId) {
        const modelPath = `models/${modelId}.glb`;
        
        // Validate file before loading
        await this.validateModelFile(modelPath);
        
        return new Promise((resolve, reject) => {
            this.loader.load(
                modelPath,
                (gltf) => {
                    const model = this.processLoadedModel(gltf, modelId);
                    resolve(model);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total) * 100;
                    this.onLoadProgress(modelId, percent);
                },
                (error) => {
                    reject(error);
                }
            );
        });
    }
    
    async validateModelFile(modelPath) {
        try {
            const response = await fetch(modelPath, { method: 'HEAD' });
            
            if (!response.ok) {
                throw new Error(`Model file not found: ${modelPath}`);
            }
            
            const contentLength = response.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > this.modelConfig.maxFileSize) {
                console.warn(`Model file is large (${(parseInt(contentLength) / 1024 / 1024).toFixed(1)}MB): ${modelPath}`);
            }
            
        } catch (error) {
            throw new Error(`Model validation failed: ${error.message}`);
        }
    }
    
    processLoadedModel(gltf, modelId) {
        const model = gltf.scene.clone();
        
        // Apply default transformations
        model.scale.copy(this.modelConfig.defaultScale);
        model.position.copy(this.modelConfig.defaultPosition);
        
        // Enable shadows
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Optimize materials for performance
                if (child.material) {
                    this.optimizeMaterial(child.material);
                }
            }
        });
        
        // Add metadata
        model.userData = {
            modelId: modelId,
            loadTime: Date.now(),
            triangleCount: this.getTriangleCount(model),
            boundingBox: new THREE.Box3().setFromObject(model)
        };
        
        return model;
    }
    
    optimizeMaterial(material) {
        // Optimize material for better performance
        if (material.map) {
            material.map.generateMipmaps = true;
            material.map.minFilter = THREE.LinearMipmapLinearFilter;
            material.map.magFilter = THREE.LinearFilter;
        }
        
        // Disable unnecessary features for performance
        material.transparent = false;
        material.alphaTest = 0;
    }
    
    getTriangleCount(model) {
        let triangleCount = 0;
        model.traverse((child) => {
            if (child.isMesh && child.geometry) {
                const geometry = child.geometry;
                if (geometry.index) {
                    triangleCount += geometry.index.count / 3;
                } else {
                    triangleCount += geometry.attributes.position.count / 3;
                }
            }
        });
        return Math.floor(triangleCount);
    }
    
    getFallbackModel(modelId) {
        const fallback = this.fallbackGeometry.clone();
        fallback.userData = {
            modelId: modelId,
            isFallback: true,
            loadTime: Date.now()
        };
        return fallback;
    }
    
    async switchModel(modelId) {
        try {
            const model = await this.loadModel(modelId);
            this.currentModel = model;
            return model;
        } catch (error) {
            console.error(`Failed to switch to model ${modelId}:`, error);
            return this.getFallbackModel(modelId);
        }
    }
    
    getCurrentModel() {
        return this.currentModel;
    }
    
    getModelInfo(modelId) {
        const model = this.models.get(modelId);
        if (!model) return null;
        
        return {
            id: modelId,
            loaded: true,
            triangleCount: model.userData.triangleCount,
            boundingBox: model.userData.boundingBox,
            isFallback: model.userData.isFallback || false,
            loadTime: model.userData.loadTime
        };
    }
    
    getAllModelsInfo() {
        const info = [];
        this.models.forEach((model, id) => {
            info.push(this.getModelInfo(id));
        });
        return info;
    }
    
    optimizeForDevice(quality = 'medium') {
        const settings = this.modelConfig.qualitySettings[quality];
        
        this.models.forEach((model) => {
            if (model.userData.triangleCount > settings.maxTriangles) {
                console.warn(`Model ${model.userData.modelId} exceeds triangle limit for ${quality} quality`);
                // Could implement LOD or geometry simplification here
            }
            
            model.traverse((child) => {
                if (child.isMesh && child.material && child.material.map) {
                    const texture = child.material.map;
                    if (texture.image && texture.image.width > settings.textureSize) {
                        console.warn(`Texture size exceeds limit for ${quality} quality`);
                        // Could implement texture resizing here
                    }
                }
            });
        });
    }
    
    onLoadProgress(modelId, percent) {
        // Dispatch custom event for progress tracking
        const event = new CustomEvent('modelLoadProgress', {
            detail: { modelId, percent }
        });
        window.dispatchEvent(event);
    }
    
    dispose() {
        // Clean up resources
        this.models.forEach((model) => {
            model.traverse((child) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(material => material.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
        });
        
        this.models.clear();
        this.loadingPromises.clear();
        
        if (this.dracoLoader) {
            this.dracoLoader.dispose();
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModelManager;
} else {
    window.ModelManager = ModelManager;
}
