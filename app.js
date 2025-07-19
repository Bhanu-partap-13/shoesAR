// Legacy AR implementation - fallback for older browsers
class LegacyShoeAR {
  constructor() {
    this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.isAndroid = /Android/i.test(navigator.userAgent);
    this.init();
  }

  init() {
    // Check if we should use native AR on mobile
    if (this.isIOS) {
      this.setupIOSAR();
      return;
    }

    if (this.isAndroid && this.hasARCore()) {
      this.setupAndroidAR();
      return;
    }

    // Fallback to web-based AR
    this.setupWebAR();
  }

  setupIOSAR() {
    const modelParam = new URLSearchParams(window.location.search).get('model');
    const modelId = modelParam ? modelParam.match(/(\d+)\.glb/)?.[1] || '1' : '1';

    document.body.innerHTML = `
      <div style='color:white;text-align:center;padding:2em;background:#000;min-height:100vh;'>
        <h2>🥿 iPhone AR Quick Look</h2>
        <p>Experience the shoe in augmented reality</p>
        <a href="models/${modelId}.usdz" rel="ar" style="
          display:inline-block;
          font-size:1.5em;
          color:#4a90e2;
          background:rgba(74,144,226,0.2);
          padding:15px 30px;
          border-radius:10px;
          text-decoration:none;
          margin:20px;
          border:2px solid #4a90e2;
        ">👆 View Shoe in AR</a>
        <p style='font-size:0.9em;opacity:0.7;'>Tap the button above to launch AR Quick Look</p>
      </div>`;
  }

  setupAndroidAR() {
    const modelParam = new URLSearchParams(window.location.search).get('model');
    const modelUrl = modelParam || 'models/1.glb';

    document.body.innerHTML = `
      <div style='color:white;text-align:center;padding:2em;background:#000;min-height:100vh;'>
        <h2>📱 Android AR Experience</h2>
        <p>View the shoe using Google's Scene Viewer</p>
        <button onclick="window.location.href='intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(window.location.origin + '/' + modelUrl)}&mode=ar_preferred#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${encodeURIComponent(window.location.origin + '/' + modelUrl)};end;'" style="
          font-size:1.5em;
          color:white;
          background:#4CAF50;
          padding:15px 30px;
          border:none;
          border-radius:10px;
          cursor:pointer;
          margin:20px;
        ">🚀 Launch AR</button>
        <p style='font-size:0.9em;opacity:0.7;'>Requires ARCore to be installed</p>
      </div>`;
  }

  hasARCore() {
    // Simple check for ARCore availability
    return navigator.userAgent.includes('Chrome') && this.isAndroid;
  }

  setupWebAR() {
    this.initWebBasedAR();
  }

  initWebBasedAR() {
    if (!document.getElementById('videoInput') || !document.getElementById('canvasAR') || !document.getElementById('threejs-canvas')) {
      console.error('Required AR elements not found');
      return;
    }

    // Webcam setup
    const video = document.getElementById('videoInput');
    const canvasAR = document.getElementById('canvasAR');
    const ctxAR = canvasAR.getContext('2d');
    // three.js setup
    const threeDiv = document.getElementById('threejs-canvas');
    let renderer, scene, camera, shoeModel;

    // Make sure three.js canvas is visible and above others
    threeDiv.style.zIndex = 10;
    threeDiv.style.pointerEvents = 'none';

    // Start webcam with error handling
    navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 640 },
        height: { ideal: 480 }
      }
    }).then(stream => {
      video.srcObject = stream;
      video.play();
    }).catch(err => {
      console.error('Camera access failed:', err);
      this.showError('Camera access denied. Please allow camera permissions.');
    });

    // Debug: show message if GLB fails to load
    const showError = (msg) => {
      let err = document.createElement('div');
      err.style.position = 'absolute';
      err.style.top = '10px';
      err.style.left = '10px';
      err.style.color = 'red';
      err.style.background = 'rgba(0,0,0,0.7)';
      err.style.padding = '8px';
      err.style.zIndex = 1000;
      err.innerText = msg;
      document.body.appendChild(err);
    };

    // Enhanced OpenCV processing with performance optimization
    let lastProcessTime = 0;
    const processInterval = 100; // Process every 100ms for better performance

    const processAR = () => {
      const currentTime = Date.now();

      if (currentTime - lastProcessTime < processInterval) {
        requestAnimationFrame(processAR);
        return;
      }

      lastProcessTime = currentTime;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctxAR.drawImage(video, 0, 0, canvasAR.width, canvasAR.height);

        if (typeof cv !== 'undefined') {
          try {
            let src = cv.imread(canvasAR);
            let dst = new cv.Mat();

            // Improved color detection for better foot tracking
            cv.cvtColor(src, dst, cv.COLOR_RGBA2HSV);

            // Detect skin color range (for foot detection)
            const lowerSkin = new cv.Mat(dst.rows, dst.cols, dst.type(), [0, 20, 70, 0]);
            const upperSkin = new cv.Mat(dst.rows, dst.cols, dst.type(), [20, 255, 255, 255]);

            cv.inRange(dst, lowerSkin, upperSkin, dst);

            // Morphological operations to reduce noise
            const kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, new cv.Size(5, 5));
            cv.morphologyEx(dst, dst, cv.MORPH_OPEN, kernel);
            cv.morphologyEx(dst, dst, cv.MORPH_CLOSE, kernel);

            let contours = new cv.MatVector();
            let hierarchy = new cv.Mat();
            cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

            let bestRect = null;
            let maxArea = 0;

            for (let i = 0; i < contours.size(); ++i) {
              let cnt = contours.get(i);
              let area = cv.contourArea(cnt);

              if (area > maxArea && area > 1000) { // Minimum area threshold
                let rect = cv.boundingRect(cnt);

                // Filter by aspect ratio (feet are typically wider than tall)
                const aspectRatio = rect.width / rect.height;
                if (aspectRatio > 0.5 && aspectRatio < 3) {
                  bestRect = rect;
                  maxArea = area;
                }
              }
            }

            if (bestRect) {
              // Draw tracking rectangle
              ctxAR.strokeStyle = 'lime';
              ctxAR.lineWidth = 3;
              ctxAR.strokeRect(bestRect.x, bestRect.y, bestRect.width, bestRect.height);

              // Update shoe model position
              if (shoeModel) {
                const centerX = bestRect.x + bestRect.width / 2;
                const centerY = bestRect.y + bestRect.height / 2;

                shoeModel.position.x = (centerX - canvasAR.width / 2) / 100;
                shoeModel.position.y = -(centerY - canvasAR.height / 2) / 100;
                shoeModel.position.z = -bestRect.width / 200; // Depth based on size
              }
            }

            // Clean up
            src.delete();
            dst.delete();
            lowerSkin.delete();
            upperSkin.delete();
            kernel.delete();
            contours.delete();
            hierarchy.delete();

          } catch (error) {
            console.error('OpenCV processing error:', error);
          }
        }
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      requestAnimationFrame(processAR);
    };

    // Wait for OpenCV.js to be ready
    const onOpenCvReady = () => {
      console.log('OpenCV.js is ready');
      requestAnimationFrame(processAR);
    };

    if (typeof cv === 'undefined') {
      document.addEventListener('opencvready', onOpenCvReady);
    } else {
      onOpenCvReady();
    }

    const initThree = () => {
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false, // Disable for better performance
          powerPreference: "default"
        });
        renderer.setSize(640, 480);
        threeDiv.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, 640/480, 0.1, 1000);
        camera.position.z = 2;

        // Improved lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Load model with better error handling
        const loader = new THREE.GLTFLoader();
        const modelParam = new URLSearchParams(window.location.search).get('model');
        const modelPath = modelParam || 'models/1.glb';

        loader.load(modelPath, (gltf) => {
          shoeModel = gltf.scene;
          shoeModel.scale.set(0.3, 0.3, 0.3);
          shoeModel.position.set(0, -0.2, 0);
          scene.add(shoeModel);
          console.log('3D model loaded successfully');
        }, undefined, (error) => {
          console.error('Failed to load 3D model:', error);
          showError('Failed to load 3D shoe model. Using fallback.');

          // Create fallback geometry
          const geometry = new THREE.BoxGeometry(0.6, 0.2, 1.0);
          const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
          shoeModel = new THREE.Mesh(geometry, material);
          shoeModel.position.set(0, -0.2, 0);
          scene.add(shoeModel);
        });

      } catch (error) {
        console.error('Three.js initialization failed:', error);
        showError('3D rendering initialization failed.');
      }
    };

    initThree();
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255,0,0,0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 1000;
      text-align: center;
      max-width: 300px;
    `;
    errorDiv.innerHTML = `<h3>Error</h3><p>${message}</p>`;
    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
}

// Initialize legacy AR if enhanced AR is not available
if (document.getElementById('videoInput') && document.getElementById('canvasAR') && document.getElementById('threejs-canvas')) {
  window.addEventListener('DOMContentLoaded', () => {
    // Check if enhanced AR is available, otherwise use legacy
    if (typeof EnhancedShoeAR === 'undefined') {
      new LegacyShoeAR();
    }
  });
}