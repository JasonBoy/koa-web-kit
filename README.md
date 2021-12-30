# koa-web-kit

[![npm](https://img.shields.io/npm/v/koa-web-kit.svg?style=flat-square)](https://www.npmjs.com/package/koa-web-kit)
[![Building Status](https://img.shields.io/travis/JasonBoy/koa-web-kit.svg?style=flat-square)](https://travis-ci.org/JasonBoy/koa-web-kit)
[![node](https://img.shields.io/node/v/koa-web-kit.svg?style=flat-square)](https://nodejs.org/)
[![Dependency Status](https://img.shields.io/david/JasonBoy/koa-web-kit.svg?style=flat-square)](https://david-dm.org/JasonBoy/koa-web-kit)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

🚀A Modern, Production-Ready, and Full-Stack Node Web Framework

[Release Notes](https://github.com/JasonBoy/koa-web-kit/releases), 
[An Introduction for koa-web-kit](https://blog.lovemily.me/koa-web-kit-a-modern-production-ready-and-full-stack-node-web-framework/)

> This readme is for v3(require node >= 16), if you need SASS/SCSS support, use [v2.x](https://github.com/JasonBoy/koa-web-kit/tree/v2.x)

## Features

- ✨Built with all modern frameworks and libs, including Koa, React(like [Vue?](https://github.com/JasonBoy/vue-web-kit))...
- 📦Get all the Node.JS full stack development experience out of the box
- 🔥Hot Module Replacement support, and bundle size analyzer report
- 📉Async/Await support for writing neat async code
- 💖Great style solutions: [Styled-Components](https://www.styled-components.com), [TailwindCSS](https://tailwindcss.com/), CSS Modules
- 🎉Simple API Proxy bundled, no complex extra reverse proxy configuration
- 🌈Available for generating static site, also with SSR support
- ⚡️Just one npm command to deploy your app to production
- 🐳Docker support(dev and prod Dockerfile)
- 👷Continuously Maintaining🍻

### Quick Start

Get the [latest version](https://github.com/JasonBoy/koa-web-kit/releases), and go to your project root,
Also available on [npm](https://www.npmjs.com/package/koa-web-kit).

> Before start, copy the `config/app-config.js.sample` to `app-config.js`(to project root or `config` dir) for local dev configuration

1. Install Dependencies

```bash
npm install
```

2. Start Dev Server

`npm run dev` to start koa with HMR enabled, or
`npm run dev:ssr` to start dev server with SSR enabled(yet HMR will be disabled for now)

3. Go to `http://localhost:3000` to view the default react page

### Project Structure

- `__tests__` dir, for your tests
- `mocks` dir, for your mock json server and other mock data
- `api` dir, the API Proxy utility, also put your api urls in `api-config.js` for universal import across your app
- `config` dir, all webpack build configs are put here, besides, some application-wide env configs getter utilities
- `services` dir, some middleware here, default logger utility also located here
- `routes` dir, put your koa app routes here
- `src` dir, all your front-end assets, react components, modules, etc...
- `utils` dir, utilities for both node.js and front-end
- `views` dir, your view templates(*NOTE: when SSR is enabled, it will use the template literal string*)
- *`build`* dir, all built assets for your project, git ignored
- *`logs`* dir, logs are put here by default, git ignored
- All other files in project root, which indicate their purposes clearly😀.

### Application Config and Environment Variables

Every project has some configuration or environment variables to make it run differently in different environments,
for koa-web-kit, it also provides different ways to configure your ENVs.

#### app-config.js/app-config.js.sample

The pre bundled file `config/app-config.js.sample` lists some common variables to use in the project, you should copy and rename it to `app-config.js` for your local config, both put it in `${project_root}` or the same `config` dir are supported:
```javascript
module.exports = {
  //http server listen port
  "PORT": 3000,
  //most commonly used env
  "NODE_ENV": "development",
  //enable/disable built-in API Proxy
  "NODE_PROXY": true,
  //config the api proxy debug level, [0, 1, 2], 0 -> nothing, default: 1 -> simple, 2 -> verbose
  "PROXY_DEBUG_LEVEL": 1,
  //static endpoint, e.g CDN for your static assets
  "STATIC_ENDPOINT": "",
  //add a alternative prefix for your "STATIC_ENDPOINT"
  "STATIC_PREFIX": "",
  //add "/" to the end of your static url, if not existed
  "PREFIX_TRAILING_SLASH": true,
  //global prefix for your routes, e.g http://a.com/prefix/...your app routes,
  //like a github project site
  "APP_PREFIX": "",
  //customize build output dir, default ./build/app
  "OUTPUT_DIR": "",
  //if true, the "/prefix" below will be stripped, otherwise, the full pathname will be used for proxy
  "CUSTOM_API_PREFIX": true,
  //if enable HMR in dev mode, `npm run dev` will automatically enable this
  "ENABLE_HMR": true,
  //if need to enable Server Side Rendering, `npm run dev:ssr` will automatically enable this, HMR need to be disabled for now
  "ENABLE_SSR": false,
  //enable CSS Modules, should disable this when SSR is enabled for now
  "CSS_MODULES": false,
  //simple dynamic routes, based on file structure(like next.js)
  "DYNAMIC_ROUTES": false,
  //single endpoint string, multiple see below, type: <string|object>
  "API_ENDPOINTS": 'http://127.0.0.1:3001',
  //API Proxies for multiple api endpoints with different prefix in router
  "API_ENDPOINTS": {
    //set a default prefix
    "defaultPrefix": "/prefix",
    //e.g http://127.0.0.1:3000/prefix/api/login -->proxy to--> http://127.0.0.1:3001/api/login
    "/prefix": "http://127.0.0.1:3001",
    "/prefix2": "http://127.0.0.1:3002",
  }
}
```

#### Environment Variables and Configuration

All the variables in `app-config.js` can be set with Environment Variables, which have higher priority than `app-config.js`.
e.g:
`> NODE_ENV=production npm start`
or
```bash
export PORT=3001
export NODE_ENV=production
npm start
```
You can also use `.env` file to config envs

#### Default `config.default.[dev|prod].js` in `config` dir

The project comes with default config files just like `app-config.js.sample`, which will be used if `app-config.js` above is not provided.

> Priority: *Environment Variables* > .env > *app-config.js* > *config.default.[dev|prod].js*

### Logs
The builtin `services/logger.js` provides some default log functionality for your app.
By default, the manual log(calling like `logger.info()`) will be put into `./logs/app.log` file,
and the http requests will be put into `./logs/requests.log`,
both will also be logged to console.
For more options, checkout the [pino](https://github.com/pinojs/pino).

```javascript
//use the default logger
const { logger, Logger } = require('../services/logger');
logger.info('message');
logger.error(new Error('test error'));
//create custom logger, log into a different file
const pino = require('pino');
//the 2nd params for the constructor is for only for pino options
const mylogger = new Logger({destination: pino.destination('./logs/my-log.log')}, {});
mylogger.info('my log message');
```

### Production Deployment

Deploy your app to production is extremely simple with only one npm script command, you can provide couple of options for different deployment phases(e.g: install, build, start server),
[pm2](https://github.com/Unitech/pm2) inside is used as node process manager.
> Global installation of PM2 is not required now, we will use the locally installed pm2, but if you want to use `pm2` cmd everywhere, you may still want to install it globally


#### Usage

`npm run deploy -- [skipInstall] [skipBuild] [skipServer]`
The last three options are boolean values in `0`(or empty, false) and `1`(true).

#### Examples:

- `npm run deploy`: no options provided, defaults to do all the tasks.
- `npm run deploy -- 1`: same as `npm run deploy:noinstall` as an alias, this will skip the `npm install --no-shrinkwrap`, and just go to build and start server.
- `npm run deploy -- 1 0 1`: which will only build your assets
- `npm run deploy -- 1 1 0`: which will just start node server, useful when all assets were built on a different machine.

> You may need to create/update the `deploy.sh` to meet your own needs.

### Powered By

<a href="https://www.jetbrains.com/?from=koa-web-kit" target="_blank">![powered by jetbrains](https://raw.githubusercontent.com/JasonBoy/koa-web-kit/master/src/assets/static/jetbrains.svg)</a>

### LICENSE

MIT @ 2016-present [jason](http://blog.lovemily.me)
