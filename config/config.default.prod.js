/**
 * The default production configuration if no custom config js file is provided
 */
module.exports = {
  PORT: 3000,
  NODE_ENV: 'production',
  NODE_PROXY: true,
  PROXY_DEBUG_LEVEL: 0,
  STATIC_ENDPOINT: '',
  STATIC_PREFIX: '',
  PREFIX_TRAILING_SLASH: true,
  APP_PREFIX: '',
  CUSTOM_API_PREFIX: true,
  API_ENDPOINTS: {
    defaultPrefix: '/api-proxy',
    '/api-proxy': 'http://127.0.0.1:3001',
    '/api-proxy-2': 'http://127.0.0.1:3002',
  },
};
