// backend/healthcheck.js
const http = require('http');

const options = {
    host: 'localhost',
    port: process.env.PORT || 3000,
    path: '/health',
    timeout: 2000,
    method: 'GET'
};

const request = http.request(options, (res) => {
    console.log(`Health check status: ${res.statusCode}`);
    if (res.statusCode === 200) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});

request.on('error', (error) => {
    console.error('Health check failed:', error.message);
    process.exit(1);
});

request.on('timeout', () => {
    console.error('Health check timeout');
    process.exit(1);
});

request.end();