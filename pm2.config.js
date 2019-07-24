module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: process.env.APP_NAME || 'app',
      script: './server.js',
      instances: 0,
      exec_mode: 'cluster_mode',
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
