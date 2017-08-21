module.exports = {
  "NODE_PORT": 3000,
  "NODE_ENV": "production",
  "NODE_PROXY": true,
  "PROXY_DEBUG_LEVEL": 0,
  "STATIC_ENDPOINT": "",
  "STATIC_PREFIX": "/public/",
  "PREFIX_TRAILING_SLASH": true,
  "APP_PREFIX": "",
  "API_ENDPOINTS": {
    "/prefix": "http://127.0.0.1:3001",
    "/prefix2": "http://127.0.0.1:3002"
  }
};
