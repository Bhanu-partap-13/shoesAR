/**
 * Advanced AR Features Module
 * Provides foot size estimation, fitting analysis, and enhanced AR capabilities
 */

class ARFeatures {
    constructor(arInstance) {
        this.ar = arInstance;
        this.footMeasurements = {
            length: 0,
            width: 0,
            estimatedSize: null,
            confidence: 0
        };
        
        this.fittingAnalysis = {
            sizeMatch: 'unknown',
            comfort: 'unknown',
            recommendations: []
        };
        
        this.lightingAdapter = new LightingAdapter();
        this.occlusionHandler = new OcclusionHandler();
        
        this.init();
    }
    
    init() {
        this.setupFootSizeEstimation();
        this.setupFittingAnalysis();
        this.setupLightingAdaptation();
        this.setupOcclusionHandling();
        this.createAdvancedUI();
    }
    
    setupFootSizeEstimation() {
        // Reference object for scale (assuming a standard credit card size: 85.6mm x 53.98mm)
        this.referenceObject = {
            width: 85.6, // mm
            height: 53.98, // mm
            detected: false,
            position: null
        };
        
        // Foot size database (US sizes to mm)
        this.shoeSizeChart = {
            'US': {
                6: { length: 240, width: 87 },
                7: { length: 247, width: 90 },
                8: { length: 254, width: 93 },
                9: { length: 261, width: 96 },
                10: { length: 268, width: 99 },
                11: { length: 275, width: 102 },
                12: { length: 282, width: 105 }
            }
        };
    }
    
    setupFittingAnalysis() {
        this.fittingCriteria = {
            lengthTolerance: 10, // mm
            widthTolerance: 5, // mm
            comfortFactors: ['arch_support', 'heel_fit', 'toe_room']
        };
    }
    
    setupLightingAdaptation() {
        this.lightingAdapter.onLightingChange = (lightingInfo) => {
            this.adaptToLighting(lightingInfo);
        };
    }
    
    setupOcclusionHandling() {
        this.occlusionHandler.onOcclusionDetected = (occlusionData) => {
            this.handleOcclusion(occlusionData);
        };
    }
    
    estimateFootSize(poseLandmarks) {
        if (!poseLandmarks) return;
        
        // Get foot landmarks
        const leftAnkle = poseLandmarks[27];
        const rightAnkle = poseLandmarks[28];
        const leftFoot = poseLandmarks[31];
        const rightFoot = poseLandmarks[32];
        
        if (!leftAnkle || !rightAnkle || !leftFoot || !rightFoot) return;
        
        // Calculate foot dimensions in pixels
        const leftFootLength = this.calculateDistance(leftAnkle, leftFoot);
        const rightFootLength = this.calculateDistance(rightAnkle, rightFoot);
        const footWidth = this.calculateDistance(leftFoot, rightFoot);
        
        // Average the measurements
        const avgFootLength = (leftFootLength + rightFootLength) / 2;
        
        // Convert to real-world measurements if reference object is detected
        if (this.referenceObject.detected) {
            const scale = this.calculateScale();
            this.footMeasurements.length = avgFootLength * scale;
            this.footMeasurements.width = footWidth * scale;
            this.footMeasurements.estimatedSize = this.estimateShoeSize();
            this.footMeasurements.confidence = this.calculateConfidence(poseLandmarks);
            
            this.updateFootSizeDisplay();
        }
    }
    
    calculateDistance(point1, point2) {
        const dx = (point1.x - point2.x) * window.innerWidth;
        const dy = (point1.y - point2.y) * window.innerHeight;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    calculateScale() {
        // This would need actual reference object detection
        // For now, use an estimated scale based on typical phone camera FOV
        return 0.3; // mm per pixel (rough estimate)
    }
    
    estimateShoeSize() {
        const { length, width } = this.footMeasurements;
        const sizeChart = this.shoeSizeChart.US;
        
        let bestMatch = null;
        let minDifference = Infinity;
        
        for (const [size, dimensions] of Object.entries(sizeChart)) {
            const lengthDiff = Math.abs(length - dimensions.length);
            const widthDiff = Math.abs(width - dimensions.width);
            const totalDiff = lengthDiff + widthDiff;
            
            if (totalDiff < minDifference) {
                minDifference = totalDiff;
                bestMatch = {
                    size: parseInt(size),
                    difference: totalDiff,
                    lengthDiff: lengthDiff,
                    widthDiff: widthDiff
                };
            }
        }
        
        return bestMatch;
    }
    
    calculateConfidence(poseLandmarks) {
        // Calculate confidence based on landmark visibility and stability
        const footLandmarks = [27, 28, 31, 32];
        let totalVisibility = 0;
        
        footLandmarks.forEach(index => {
            if (poseLandmarks[index]) {
                totalVisibility += poseLandmarks[index].visibility || 0;
            }
        });
        
        return totalVisibility / footLandmarks.length;
    }
    
    analyzeFitting() {
        if (!this.footMeasurements.estimatedSize) return;
        
        const currentShoeSize = this.getCurrentShoeSize(); // From product data
        const estimatedSize = this.footMeasurements.estimatedSize.size;
        
        // Size match analysis
        const sizeDifference = Math.abs(currentShoeSize - estimatedSize);
        
        if (sizeDifference === 0) {
            this.fittingAnalysis.sizeMatch = 'perfect';
        } else if (sizeDifference <= 0.5) {
            this.fittingAnalysis.sizeMatch = 'good';
        } else if (sizeDifference <= 1) {
            this.fittingAnalysis.sizeMatch = 'acceptable';
        } else {
            this.fittingAnalysis.sizeMatch = 'poor';
        }
        
        // Comfort analysis
        this.analyzeComfort();
        
        // Generate recommendations
        this.generateRecommendations();
        
        this.updateFittingDisplay();
    }
    
    analyzeComfort() {
        const { lengthDiff, widthDiff } = this.footMeasurements.estimatedSize;
        
        if (lengthDiff <= this.fittingCriteria.lengthTolerance && 
            widthDiff <= this.fittingCriteria.widthTolerance) {
            this.fittingAnalysis.comfort = 'comfortable';
        } else if (lengthDiff <= this.fittingCriteria.lengthTolerance * 1.5 && 
                   widthDiff <= this.fittingCriteria.widthTolerance * 1.5) {
            this.fittingAnalysis.comfort = 'moderate';
        } else {
            this.fittingAnalysis.comfort = 'uncomfortable';
        }
    }
    
    generateRecommendations() {
        this.fittingAnalysis.recommendations = [];
        
        const { lengthDiff, widthDiff } = this.footMeasurements.estimatedSize;
        
        if (lengthDiff > this.fittingCriteria.lengthTolerance) {
            this.fittingAnalysis.recommendations.push('Consider a larger size for better length fit');
        }
        
        if (widthDiff > this.fittingCriteria.widthTolerance) {
            this.fittingAnalysis.recommendations.push('Consider a wider width for better comfort');
        }
        
        if (this.fittingAnalysis.sizeMatch === 'poor') {
            this.fittingAnalysis.recommendations.push('This shoe size may not be suitable for your foot');
        }
        
        if (this.fittingAnalysis.comfort === 'uncomfortable') {
            this.fittingAnalysis.recommendations.push('Try a different size or style for better comfort');
        }
    }
    
    getCurrentShoeSize() {
        // Get current shoe size from product data
        const urlParams = new URLSearchParams(window.location.search);
        const modelId = urlParams.get('model') || '1';
        
        // This would come from your product database
        const productSizes = {
            '1': 8,
            '2': 9,
            '3': 10
        };
        
        return productSizes[modelId] || 8;
    }
    
    adaptToLighting(lightingInfo) {
        if (!this.ar.scene) return;
        
        // Adjust lighting based on environment
        const ambientLight = this.ar.scene.getObjectByName('ambientLight');
        const directionalLight = this.ar.scene.getObjectByName('directionalLight');
        
        if (lightingInfo.brightness < 0.3) {
            // Low light conditions
            if (ambientLight) ambientLight.intensity = 0.8;
            if (directionalLight) directionalLight.intensity = 0.6;
        } else if (lightingInfo.brightness > 0.7) {
            // Bright conditions
            if (ambientLight) ambientLight.intensity = 0.4;
            if (directionalLight) directionalLight.intensity = 1.0;
        }
        
        // Adjust material properties for better visibility
        if (this.ar.shoeModel) {
            this.ar.shoeModel.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.emissive.setScalar(lightingInfo.brightness < 0.3 ? 0.1 : 0);
                }
            });
        }
    }
    
    handleOcclusion(occlusionData) {
        if (!this.ar.shoeModel) return;
        
        // Adjust model opacity based on occlusion
        const opacity = occlusionData.isOccluded ? 0.5 : 1.0;
        
        this.ar.shoeModel.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.transparent = occlusionData.isOccluded;
                child.material.opacity = opacity;
            }
        });
    }
    
    createAdvancedUI() {
        // Create UI elements for advanced features
        const advancedPanel = document.createElement('div');
        advancedPanel.id = 'advanced-panel';
        advancedPanel.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 15px;
            border-radius: 10px;
            font-size: 12px;
            z-index: 15;
            max-width: 250px;
        `;
        
        advancedPanel.innerHTML = `
            <h4>AR Analysis</h4>
            <div id="foot-size-info">
                <strong>Foot Size:</strong>
                <div>Length: <span id="foot-length">--</span>mm</div>
                <div>Width: <span id="foot-width">--</span>mm</div>
                <div>Estimated Size: <span id="estimated-size">--</span></div>
                <div>Confidence: <span id="size-confidence">--</span>%</div>
            </div>
            <div id="fitting-info">
                <strong>Fitting Analysis:</strong>
                <div>Size Match: <span id="size-match">--</span></div>
                <div>Comfort: <span id="comfort-level">--</span></div>
                <div id="recommendations"></div>
            </div>
        `;
        
        document.body.appendChild(advancedPanel);
    }
    
    updateFootSizeDisplay() {
        document.getElementById('foot-length').textContent = this.footMeasurements.length.toFixed(1);
        document.getElementById('foot-width').textContent = this.footMeasurements.width.toFixed(1);
        document.getElementById('estimated-size').textContent = 
            this.footMeasurements.estimatedSize ? `US ${this.footMeasurements.estimatedSize.size}` : '--';
        document.getElementById('size-confidence').textContent = 
            (this.footMeasurements.confidence * 100).toFixed(0);
    }
    
    updateFittingDisplay() {
        document.getElementById('size-match').textContent = this.fittingAnalysis.sizeMatch;
        document.getElementById('comfort-level').textContent = this.fittingAnalysis.comfort;
        
        const recommendationsDiv = document.getElementById('recommendations');
        recommendationsDiv.innerHTML = this.fittingAnalysis.recommendations
            .map(rec => `<div>• ${rec}</div>`)
            .join('');
    }
}

// Simple lighting adapter class
class LightingAdapter {
    constructor() {
        this.onLightingChange = null;
        this.startMonitoring();
    }
    
    startMonitoring() {
        // Monitor ambient light changes (simplified)
        setInterval(() => {
            const lightingInfo = {
                brightness: Math.random() * 0.5 + 0.3, // Simulated
                temperature: 5500 // Daylight
            };
            
            if (this.onLightingChange) {
                this.onLightingChange(lightingInfo);
            }
        }, 2000);
    }
}

// Simple occlusion handler class
class OcclusionHandler {
    constructor() {
        this.onOcclusionDetected = null;
        this.startDetection();
    }
    
    startDetection() {
        // Simplified occlusion detection
        setInterval(() => {
            const occlusionData = {
                isOccluded: Math.random() < 0.1, // 10% chance of occlusion
                occlusionLevel: Math.random()
            };
            
            if (this.onOcclusionDetected) {
                this.onOcclusionDetected(occlusionData);
            }
        }, 1000);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ARFeatures;
} else {
    window.ARFeatures = ARFeatures;
}
