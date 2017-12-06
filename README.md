# koa-web-kit

[![Building Status](https://travis-ci.org/JasonBoy/koa-web-kit.svg?branch=master)](https://travis-ci.org/JasonBoy/koa-web-kit) [![Dependency Status](https://david-dm.org/JasonBoy/koa-web-kit.svg)](https://david-dm.org/JasonBoy/koa-web-kit)

🚀A Modern, Production-Ready, and Full-Stack Node Web Framework

## Features

- ✨Built with all modern frameworks and libs, including Koa2, React-v16, Bootstrap-v4, Webpack, ES6, Babel...
- 📦Get all the Node.JS full stack development experience out of the box
- 👀Compile your source code instantly with just `npm run watch`
- 📉Async/Await support for writing neat async code
- 💖SASS preprocessor, PostCSS, autoprefixer for better css compatibility
- 🎉Simple API Proxy bundled, no complex extra nginx configuration
- 🌈PreConfigured Logger utility for better debug life
- ⚡️Just one npm command to deploy your app to production
- 👷Continuously Maintaining🍻

### Quick Start

Get the [latest version](https://github.com/JasonBoy/koa-web-kit/releases), and go to your project root,

1. Install Dependencies  
```
#with yarn, yarn.lock is included
> yarn
#or npm, no package-lock.json is included, use it as your own taste 
> npm install --no-shrinkwrap
```
2. Build Assets  
`npm run build` or `npm run watch` for auto recompile your code
3. Start Koa Http Server  
`npm start`
4. Go to `http://localhost:3000` to view the default react page

### Project Structure

- `api` dir, the API Proxy utility, also put your api urls here for universal import cross your app
- `config` dir, all webpack build configs are put here, besides, some application-wide env configs getter utility
- `mw` dir, some middleware here, default logger utility also located here
- `routes` dir, put your koa app routes here
- `src` dir, all your front-end assets, react components, services, etc...
- `test` dir, for your tests
- `utils` dir, utilities for both node.js and front-end
- `views` dir, your view templates
- `build` dir, all built assets for your project, git ignored
- `logs` dir, logs are put here by default, git ignored
- All other files in project root, which indicate there purpose clearly😀

### Application Config and Environment Variables

Every project has some configuration or environment variables to make it run in different environment,  
for koa-web-kit, we also provide different ways to configure your ENVs.

#### config.json/config.json.sample

The preconfigured file `config.json.sample` lists some common variables to use in the project, you should copy and rename it to `config.json` for your local config:
```javascript
config = {
  "NODE_PORT": 3000, //http server listen port
  "NODE_ENV": "development", //most commonly used env
  "NODE_PROXY": true, //enable/disable built API Proxy
  "PROXY_DEBUG_LEVEL": 0, //config the api proxy debug level, [0, 1, 2], 0 -> nothing
  "STATIC_ENDPOINT": "", //static endpoint, e.g CDN for your static assets
  "STATIC_PREFIX": "/public/", //add a alternative prefix for your "STATIC_ENDPOINT"
  "PREFIX_TRAILING_SLASH": true, //add "/" to the end of your static url, if not existed
  "APP_PREFIX": "", //global prefix for your routes, e.g http://a.com/prefix/...your app routes
  //API PROXY for multiple prefix
  "API_ENDPOINTS": {
    "/prefix": "http://127.0.0.1:3001",
    "/prefix2": "http://127.0.0.1:3002"
  }
}
```

#### Environment Variables

All the variables in config.json can be set with Environment Variables, which have higher priority.
e.g:  
`> NODE_ENV=production npm start`  
or  
```bash
export NODE_PORT=3001
export NODE_ENV=production
npm start
``` 
Everything you can do within cli.

#### `config/build.dev(prod).js` in source code

The project comes with default configs just like `config.json`, if neither above are provided.

> Priority: *Environment Variables* > *config.json* > *default config/build.dev(prod).js*

### Template Engines
__Default template engine is [nunjucks](https://github.com/mozilla/nunjucks)__,
Since we are using the [consolidate.js](https://github.com/tj/consolidate.js), you can use any template engine you want.

### Logs
The builtin `mw/logger.js` provides some default log functionality for your app, it uses [winston](https://github.com/winstonjs/winston) for async log. You can add more `transport`s for different level logging.

### Production Deployment

Deploy your app to production is simple with only one npm script command, you can provide different options in different deployment phase(install, build, start server),    
[pm2](https://github.com/Unitech/pm2) inside is used as node process manager.

#### Usage

`npm run deploy -- moduleName clusterNumber skipInstall skipBuild skipServer`  
Last three options are boolean values in `0`(or empty, false) and `1`(true),  
`moduleName` is only useful if you didn't skipServer, but you still need to provide it if you have options following, I will improve this later on🤣.

#### Examples:

- `npm run deploy`: no options provided, default values are:  
  `moduleName`=app; `clusterNumber`=0, which is "max"; and install deps, start building assets, and last start node server.
- `npm run deploy -- app2 2`: if you have multi node apps within one vm, you need to use different name as show with "app2", also I only need to open 2 node instances here.
- `npm run deploy -- app 2 1`: this will skip the `npm install --no-shrinkwrap`, and just go to build and start server.
- `npm run deploy -- app 2 1 0 1`: which will only build your assets
- `npm run deploy -- app 2 1 1 0`: which will just start node server, useful when all assets were built on a different machine.

> You should create/update the script to meet your own needs. 

### License

MIT @ 2016-2018 [jason](http://blog.lovemily.me)