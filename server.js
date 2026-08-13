var http = require('http');
var httpProxy = require('http-proxy');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

// 1. Start Lavalink Java Process
console.log('[Runner] Starting Lavalink Java Process...');
var lavalink = spawn('java', ['-jar', 'Lavalink.jar'], {
    cwd: __dirname,
    stdio: 'inherit'
});

lavalink.on('exit', function(code) {
    console.log('[Runner] Lavalink exited with code ' + code);
});

// 2. Create Proxy Server
var proxy = httpProxy.createProxyServer({});

proxy.on('error', function(err, req, res) {
    if (res.writeHead) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Lavalink is starting up or unavailable. Please refresh in a few seconds.');
    }
});

// 3. Create Web Server to handle root HTML + Lavalink WebSocket/API
var server = http.createServer(function(req, res) {
    // Ping endpoint for real-time latency checks
    if (req.url === '/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    }

    // If user opens the website in browser (Root path "/")
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        // Forward all other requests (APIs/Lavalink endpoints) to Lavalink (Port 2333)
        proxy.web(req, res, { target: 'http://127.0.0.1:2333' });
    }
});

// Support WebSockets for Lavalink
server.on('upgrade', function(req, socket, head) {
    proxy.ws(req, socket, head, { target: 'http://127.0.0.1:2333' });
});

var PORT = process.env.PORT || 10000;
server.listen(PORT, function() {
    console.log('[Runner] Web Server & Proxy running on port ' + PORT);
});
