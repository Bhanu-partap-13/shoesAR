/**
 * IP Address Detection for Mobile QR Code Access
 * Detects the computer's local IP address for mobile device access
 */

class IPDetector {
    constructor() {
        this.localIP = null;
        this.detectionMethods = [];
    }
    
    async detectLocalIP() {
        // Try multiple methods to detect local IP
        const methods = [
            this.detectViaRTC.bind(this),
            this.detectViaFetch.bind(this),
            this.detectViaWebSocket.bind(this)
        ];
        
        for (const method of methods) {
            try {
                const ip = await method();
                if (ip && this.isValidLocalIP(ip)) {
                    this.localIP = ip;
                    console.log('Detected local IP:', ip);
                    return ip;
                }
            } catch (error) {
                console.warn('IP detection method failed:', error);
            }
        }
        
        // Fallback to manual detection
        return this.promptForIP();
    }
    
    async detectViaRTC() {
        return new Promise((resolve, reject) => {
            const rtc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            rtc.createDataChannel('');
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            
            rtc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                    if (ipMatch && this.isValidLocalIP(ipMatch[1])) {
                        rtc.close();
                        resolve(ipMatch[1]);
                    }
                }
            };
            
            setTimeout(() => {
                rtc.close();
                reject(new Error('RTC IP detection timeout'));
            }, 3000);
        });
    }
    
    async detectViaFetch() {
        // This method won't work in browser due to CORS, but included for completeness
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            throw new Error('Fetch IP detection failed');
        }
    }
    
    async detectViaWebSocket() {
        // Alternative method using WebSocket
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket('wss://echo.websocket.org');
                ws.onopen = () => {
                    ws.close();
                    reject(new Error('WebSocket method not implemented'));
                };
                ws.onerror = () => {
                    reject(new Error('WebSocket IP detection failed'));
                };
            } catch (error) {
                reject(error);
            }
        });
    }
    
    isValidLocalIP(ip) {
        // Check if IP is a valid local network IP
        const localRanges = [
            /^192\.168\./,  // 192.168.x.x
            /^10\./,        // 10.x.x.x
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./  // 172.16.x.x - 172.31.x.x
        ];
        
        return localRanges.some(range => range.test(ip)) && ip !== '127.0.0.1';
    }
    
    promptForIP() {
        // Show user their detected IPs and let them choose
        const detectedIPs = [
            '192.168.2.163',  // From our detection
            '192.168.1.1',    // Common router IP
            '192.168.0.1'     // Another common router IP
        ];
        
        const ipList = detectedIPs.map(ip => `• ${ip}`).join('\n');
        
        const userIP = prompt(`
Could not automatically detect your computer's IP address.

Please enter your computer's local IP address for mobile access.

Common IPs detected:
${ipList}

To find your IP:
Windows: Open Command Prompt → type "ipconfig"
Mac: System Preferences → Network
Linux: Terminal → type "ifconfig"

Enter your IP address:`);
        
        if (userIP && this.isValidLocalIP(userIP)) {
            this.localIP = userIP;
            return userIP;
        }
        
        // Fallback to most likely IP
        return '192.168.2.163';
    }
    
    getServerURL(port = 8000) {
        const ip = this.localIP || '192.168.2.163';
        return `http://${ip}:${port}`;
    }
    
    getMobileARURL(productId, port = 8000) {
        const baseURL = this.getServerURL(port);
        return `${baseURL}/simple-mobile-ar.html?id=${productId}`;
    }
    
    generateQRCodeURL(productId, port = 8000) {
        const mobileURL = this.getMobileARURL(productId, port);
        return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(mobileURL)}&size=180x180&ecc=M&margin=1`;
    }
    
    displayNetworkInfo() {
        const info = document.createElement('div');
        info.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
            z-index: 1000;
            max-width: 200px;
        `;
        
        info.innerHTML = `
            <strong>Network Info:</strong><br>
            Computer IP: ${this.localIP || 'Detecting...'}<br>
            Server: ${this.getServerURL()}<br>
            <small>For mobile QR access</small>
        `;
        
        document.body.appendChild(info);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (info.parentNode) {
                info.parentNode.removeChild(info);
            }
        }, 10000);
    }
}

// Global instance
window.ipDetector = new IPDetector();

// Auto-detect IP when script loads
window.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.ipDetector.detectLocalIP();
        console.log('IP detection complete:', window.ipDetector.localIP);
    } catch (error) {
        console.warn('IP detection failed:', error);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPDetector;
}
