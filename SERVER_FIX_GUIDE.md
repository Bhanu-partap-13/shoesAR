# 🔧 Server Fix Guide - Complete Solution

## ❌ **Common Server Errors**

### **1. "ERR_CONNECTION_REFUSED"**
- **Meaning**: No server is running on port 8000
- **Fix**: Start the server

### **2. "ERR_EMPTY_RESPONSE"**
- **Meaning**: Server started but crashed or not responding
- **Fix**: Restart the server properly

### **3. "This site can't be reached"**
- **Meaning**: Network/firewall issue or wrong URL
- **Fix**: Check URL and firewall settings

## ✅ **Quick Fix Solutions**

### **Method 1: Use Batch File (Windows)**
```bash
# Double-click this file:
start-server.bat
```

### **Method 2: Use Shell Script (Mac/Linux)**
```bash
# Make executable and run:
chmod +x start-server.sh
./start-server.sh
```

### **Method 3: Manual Command**
```bash
# Navigate to project folder
cd shoe-ar-main

# Start server
python -m http.server 8000
```

### **Method 4: Alternative Port**
```bash
# If port 8000 is busy, use different port
python -m http.server 8001
# Then use: http://localhost:8001
```

## 🔍 **Diagnostic Steps**

### **Step 1: Check Python**
```bash
python --version
# Should show: Python 3.x.x
```

### **Step 2: Check Directory**
```bash
# Make sure you're in the right folder
ls
# Should see: index.html, models/, scripts/, etc.
```

### **Step 3: Check Port**
```bash
# Windows
netstat -an | findstr :8000

# Mac/Linux
netstat -an | grep :8000

# Should show: LISTENING
```

### **Step 4: Test Server**
Open: http://localhost:8000/test-server.html

## 🚀 **Server Start Process**

### **Complete Restart Process:**
1. **Stop any existing server**: Ctrl+C in terminal
2. **Check port is free**: `netstat -an | findstr :8000`
3. **Navigate to project**: `cd shoe-ar-main`
4. **Start server**: `python -m http.server 8000`
5. **Test in browser**: http://localhost:8000

### **Verify Server is Working:**
- ✅ Terminal shows: "Serving HTTP on 0.0.0.0 port 8000"
- ✅ Browser loads: http://localhost:8000
- ✅ Test page works: http://localhost:8000/test-server.html
- ✅ No error messages in terminal

## 🔧 **Advanced Troubleshooting**

### **Issue: Python Not Found**
**Windows:**
```bash
# Try full path
C:\Python39\python.exe -m http.server 8000

# Or install Python from python.org
```

**Mac:**
```bash
# Use python3
python3 -m http.server 8000

# Or install via Homebrew
brew install python
```

### **Issue: Port Already in Use**
```bash
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (Windows)
taskkill /PID [PID_NUMBER] /F

# Kill the process (Mac/Linux)
kill -9 [PID_NUMBER]

# Or use different port
python -m http.server 8001
```

### **Issue: Permission Denied**
```bash
# Windows: Run as Administrator
# Mac/Linux: Use sudo or different port
python -m http.server 8080
```

### **Issue: Firewall Blocking**
**Windows:**
1. Windows Defender → Allow Python through firewall
2. Or temporarily disable firewall for testing

**Mac:**
1. System Preferences → Security → Firewall
2. Allow Python or disable firewall for testing

## 📱 **Mobile Access Issues**

### **Issue: Mobile can't access localhost**
**Solution**: Use computer's IP address
```bash
# Find your IP
ipconfig (Windows)
ifconfig (Mac/Linux)

# Use IP instead of localhost
http://192.168.1.100:8000
```

### **Issue: HTTPS Required for AR**
**Solution**: Use ngrok for HTTPS
```bash
# Install ngrok
# Then run:
ngrok http 8000

# Use the https URL provided
```

## 🎯 **Testing Checklist**

### **Basic Server Test:**
- [ ] Server starts without errors
- [ ] http://localhost:8000 loads
- [ ] http://localhost:8000/test-server.html works
- [ ] No error messages in terminal

### **AR Features Test:**
- [ ] Homepage loads with carousel
- [ ] "Try AR" buttons work
- [ ] QR codes generate
- [ ] Mobile AR page loads
- [ ] Model files accessible

### **Mobile Test:**
- [ ] Mobile devices can access server
- [ ] QR codes work when scanned
- [ ] AR features work on mobile
- [ ] No CORS errors

## 🆘 **Emergency Solutions**

### **If Nothing Works:**

**Option 1: Use File Protocol**
```bash
# Open index.html directly in browser
# Limited functionality but basic viewing works
```

**Option 2: Use Online IDE**
```bash
# Upload files to:
# - CodePen.io
# - JSFiddle.net
# - Repl.it
# - GitHub Pages
```

**Option 3: Use VS Code Live Server**
```bash
# Install Live Server extension in VS Code
# Right-click index.html → "Open with Live Server"
```

**Option 4: Use Node.js Server**
```bash
# If Node.js is installed
npx http-server -p 8000 -c-1
```

## 📋 **Server Status Commands**

### **Check if Server is Running:**
```bash
# Windows
netstat -an | findstr :8000
tasklist | findstr python

# Mac/Linux
netstat -an | grep :8000
ps aux | grep python
```

### **Start Server (All Methods):**
```bash
# Method 1: Simple Python server
python -m http.server 8000

# Method 2: Custom server script
python scripts/server.py

# Method 3: Batch file (Windows)
start-server.bat

# Method 4: Shell script (Mac/Linux)
./start-server.sh
```

### **Stop Server:**
```bash
# In terminal where server is running
Ctrl+C

# Or kill process
taskkill /PID [PID] /F  (Windows)
kill -9 [PID]          (Mac/Linux)
```

## ✅ **Success Indicators**

### **Server Working Correctly:**
- ✅ Terminal shows server startup message
- ✅ http://localhost:8000 loads homepage
- ✅ http://localhost:8000/test-server.html shows success page
- ✅ All links and buttons work
- ✅ Mobile devices can access the server
- ✅ AR features work properly

### **Ready for Testing:**
- ✅ Homepage carousel animates
- ✅ "Try AR" buttons show QR codes
- ✅ QR codes can be scanned
- ✅ Mobile AR experience loads
- ✅ 3D models display correctly

**If all indicators are green, your server is working perfectly!** 🎉
