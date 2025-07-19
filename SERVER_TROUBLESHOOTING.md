# 🔧 Server Troubleshooting Guide

## ❌ Common Error: "localhost refused to connect" (ERR_CONNECTION_REFUSED)

This error means the development server is not running. Here's how to fix it:

## ✅ **Quick Fix Steps**

### **1. Start the Server**
```bash
# Navigate to the project directory
cd shoe-ar-main

# Start the server (choose one method)
python scripts/server.py
# OR
python -m http.server 8000
```

### **2. Verify Server is Running**
```bash
# Check if port 8000 is in use
netstat -an | findstr :8000
# Should show: TCP 0.0.0.0:8000 ... LISTENING
```

### **3. Test in Browser**
Open: http://localhost:8000

## 🔍 **Detailed Troubleshooting**

### **Check 1: Is Python Installed?**
```bash
python --version
# Should show Python 3.x.x
```

### **Check 2: Are You in the Right Directory?**
```bash
# Should be in the shoe-ar-main directory
ls
# Should see: index.html, models/, scripts/, etc.
```

### **Check 3: Is Port 8000 Available?**
```bash
# Check what's using port 8000
netstat -ano | findstr :8000

# If another process is using it, either:
# 1. Kill that process, or
# 2. Use a different port
python -m http.server 8001
```

### **Check 4: Firewall/Antivirus Issues**
- **Windows Defender**: May block Python server
- **Antivirus**: May block local server connections
- **Solution**: Add Python to firewall exceptions

### **Check 5: Browser Issues**
- **Clear Cache**: Ctrl+F5 to hard refresh
- **Try Different Browser**: Chrome, Firefox, Edge
- **Try Incognito Mode**: Rules out extension issues

## 🚀 **Server Start Methods**

### **Method 1: Custom Server (Recommended)**
```bash
cd shoe-ar-main
python scripts/server.py
```
**Benefits**: 
- CORS headers for AR content
- Proper MIME types for USDZ files
- Custom error handling

### **Method 2: Simple Python Server**
```bash
cd shoe-ar-main
python -m http.server 8000
```
**Benefits**: 
- Built into Python
- No dependencies
- Quick and simple

### **Method 3: Node.js Server (if Node.js installed)**
```bash
cd shoe-ar-main
npx http-server -p 8000 -c-1
```
**Benefits**: 
- Good for development
- Auto-refresh capabilities
- Better performance

## 🔧 **Common Issues & Solutions**

### **Issue: "Permission Denied"**
**Solution**: Run as administrator or use different port
```bash
python -m http.server 8001
```

### **Issue: "Address already in use"**
**Solution**: Kill existing process or use different port
```bash
# Find process using port 8000
netstat -ano | findstr :8000
# Kill process (replace PID with actual process ID)
taskkill /PID 1234 /F
```

### **Issue: "Python not found"**
**Solution**: Install Python or use full path
```bash
# Download Python from python.org
# Or use full path
C:\Python39\python.exe -m http.server 8000
```

### **Issue: "Module not found"**
**Solution**: Check Python installation
```bash
python -c "import http.server; print('OK')"
```

### **Issue: Browser shows "This site can't be reached"**
**Solutions**:
1. **Check server is running**: Look for "Server running at..." message
2. **Try different URL**: http://127.0.0.1:8000
3. **Check firewall**: Temporarily disable to test
4. **Try different port**: Use 8001, 8080, or 3000

## 📱 **Mobile Testing Issues**

### **Issue: Mobile can't access localhost**
**Solution**: Use your computer's IP address
```bash
# Find your IP address
ipconfig
# Use IP instead of localhost
http://192.168.1.100:8000
```

### **Issue: HTTPS required for AR**
**Solution**: Use ngrok or similar service
```bash
# Install ngrok
ngrok http 8000
# Use the https URL provided
```

## 🎯 **Quick Diagnostic Commands**

### **Check Everything at Once:**
```bash
# 1. Check Python
python --version

# 2. Check current directory
pwd
ls

# 3. Check if server is running
netstat -an | findstr :8000

# 4. Start server
python scripts/server.py
```

### **Test Server Response:**
```bash
# Test if server responds
curl http://localhost:8000
# Should return HTML content
```

## ✅ **Server Status Indicators**

### **Server Running Successfully:**
- ✅ Terminal shows "Server running at http://localhost:8000"
- ✅ `netstat` shows port 8000 LISTENING
- ✅ Browser loads http://localhost:8000
- ✅ No error messages in terminal

### **Server Not Running:**
- ❌ Browser shows "ERR_CONNECTION_REFUSED"
- ❌ `netstat` shows no port 8000
- ❌ Terminal shows no server messages
- ❌ Python process not visible

## 🔄 **Restart Server Process**

### **If Server Stops Working:**
1. **Stop Server**: Ctrl+C in terminal
2. **Check Port**: `netstat -an | findstr :8000`
3. **Restart Server**: `python scripts/server.py`
4. **Test Browser**: http://localhost:8000

### **If Port is Stuck:**
```bash
# Find and kill process
netstat -ano | findstr :8000
taskkill /PID [PID_NUMBER] /F

# Then restart server
python scripts/server.py
```

## 📞 **Emergency Backup Methods**

### **If Nothing Works:**
1. **Use Different Port**: `python -m http.server 8001`
2. **Use File:// Protocol**: Open index.html directly (limited functionality)
3. **Use Online IDE**: Upload files to CodePen, JSFiddle, etc.
4. **Use Live Server Extension**: In VS Code or similar editor

## 🎉 **Success Checklist**

- ✅ Server starts without errors
- ✅ Browser loads http://localhost:8000
- ✅ Homepage shows shoe carousel
- ✅ "Try AR" buttons work
- ✅ QR codes generate properly
- ✅ Mobile devices can access the site

**If all items are checked, your server is working perfectly!**
