module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'koa-web-kit',
      script: './app.js',
      instances: 0,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      vizion: false,
    },
  ],
};
