# koa-web-kit

[![npm](https://img.shields.io/npm/v/koa-web-kit.svg)](https://www.npmjs.com/package/koa-web-kit)
[![Building Status](https://travis-ci.org/JasonBoy/koa-web-kit.svg?branch=master)](https://travis-ci.org/JasonBoy/koa-web-kit)
[![node](https://img.shields.io/node/v/koa-web-kit.svg)](https://nodejs.org/)
[![Dependency Status](https://david-dm.org/JasonBoy/koa-web-kit.svg)](https://david-dm.org/JasonBoy/koa-web-kit)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

🚀A Modern, Production-Ready, and Full-Stack Node Web Framework

[An Introduction for koa-web-kit](https://blog.lovemily.me/koa-web-kit-a-modern-production-ready-and-full-stack-node-web-framework/)

## Features

- ✨Built with all modern frameworks and libs, including Koa2, React-v16, Bootstrap-v4, Webpack, ES6, Babel...
- 📦Get all the Node.JS full stack development experience out of the box
- 🔥Hot Module Replacement support without refreshing whole page, and bundle size analyzer support
- 📉Async/Await support for writing neat async code
- 💖SASS preprocessor, PostCSS, autoprefixer for better css compatibility
- 🎉Simple API Proxy bundled, no complex extra nginx configuration
- 🌈Available for generating static react site
- ⚡️Just one npm command to deploy your app to production
- 👷Continuously Maintaining🍻

### Quick Start

Get the [latest version](https://github.com/JasonBoy/koa-web-kit/releases), and go to your project root,  
Also available on [npm](https://www.npmjs.com/package/koa-web-kit), `npm i koa-web-kit --save`

> Before start, recommend to copy the `config.json.sample` to `config.json` for local dev configuration

1. Install Dependencies  
```bash
#with yarn, yarn.lock is included
yarn
#or npm, no package-lock.json is included, use it as your own taste 
npm install --no-shrinkwrap
```
2. Build Assets  
`npm run build` or `npm run watch` for auto recompile your code, or  
`npm run dev` to start koa with HMR enabled(step 2 & 3 combined, skip step 3)  
3. Start Koa Http Server  
`npm start`  
4. Go to `http://localhost:3000` to view the default react page, the demo page is based on [create-react-app](https://github.com/facebookincubator/create-react-app)

### Project Structure

- `api` dir, the API Proxy utility, also put your api urls here for universal import across your app
- `config` dir, all webpack build configs are put here, besides, some application-wide env configs getter utility
- `mw` dir, some middleware here, default logger utility also located here
- `routes` dir, put your koa app routes here
- `src` dir, all your front-end assets, react components, services, etc...
- `test` dir, for your tests
- `utils` dir, utilities for both node.js and front-end
- `views` dir, your view templates
- *`build`* dir, all built assets for your project, git ignored
- *`logs`* dir, logs are put here by default, git ignored
- All other files in project root, which indicate their purposes clearly😀.

### Application Config and Environment Variables

Every project has some configuration or environment variables to make it run differently in different environment,  
for koa-web-kit, we also provide different ways to configure your ENVs.

#### app-config.js/app-config.js.sample

The pre bundled file `app-config.js.sample` lists some common variables to use in the project, you should copy and rename it to `app-config.js` for your local config:
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

#### Environment Variables

All the variables in config.json can be set with Environment Variables, which have higher priority than `app-config.js`.
e.g:  
`> NODE_ENV=production npm start`  
or  
```bash
export PORT=3001
export NODE_ENV=production
npm start
``` 
BTW you can do Everything you can within cli to set your env.

#### Default `config.default/dev(prod).js` in source code

The project comes with default config files just like `config.json`, which will be used if neither above are provided.

> Priority: *Environment Variables* > *app-config.js* > *default config.default./dev(prod).js*

### Template Engines
__Default template engine is [nunjucks](https://github.com/mozilla/nunjucks)__,
Since we are using the [consolidate.js](https://github.com/tj/consolidate.js), you can use any template engine you want.

### Logs
The builtin `mw/logger.js` provides some default log functionality for your app, it uses [winston](https://github.com/winstonjs/winston) for async log. You can add more `transport`s for different level logging.

### Production Deployment

Deploy your app to production is extremely simple with only one npm script command, you can provide different options in different deployment phases(e.g: install, build, start server),    
[pm2](https://github.com/Unitech/pm2) inside is used as node process manager.  
> Global installation of PM2 is not required now, we will use the locally installed pm2.


#### Usage

`npm run deploy -- skipInstall skipBuild skipServer`  
The last three options are boolean values in `0`(or empty, false) and `1`(true).  

#### Examples:

- `npm run deploy`: no options provided, defaults do the tasks.  
- `npm run deploy -- 1`: this will skip the `npm install --no-shrinkwrap`, and just go to build and start server.
- `npm run deploy -- 1 0 1`: which will only build your assets
- `npm run deploy -- 1 1 0`: which will just start node server, useful when all assets were built on a different machine.

> You may need to create/update the script to meet your own needs. 

### License

MIT @ 2016-2018 [jason](http://blog.lovemily.me)
