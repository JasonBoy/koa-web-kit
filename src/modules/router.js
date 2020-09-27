import loadable from '@loadable/component';

const INDEX_PAGE = 'index';

let routesGenerated = false;
let routes = [];

export function getPageModules() {
  const context = require.context('src/pages', true, /\.jsx?$/, 'lazy');
  console.log('context.keys(): ', context.keys());
  return context.keys().map((key) => {
    return {
      key,
      context,
      ...normalizeModulePath(key),
    };
  });
}

export function normalizeModulePath(path) {
  const withoutRoot = path.slice(2);
  const parts = withoutRoot.split('/');
  const filename = parts[parts.length - 1];
  const filenameMatch = filename.match(/([\w_-]+)\..+$/);
  const moduleName = filenameMatch ? filenameMatch[1] : '';
  return {
    name: moduleName,
    filename,
    path: isIndexPage(moduleName)
      ? '/'
      : ['', ...parts.slice(0, parts.length - 1), moduleName].join('/'),
    dir: withoutRoot,
    fullPath: path,
  };
}

function isIndexPage(name) {
  return name === INDEX_PAGE;
}

export function generateDynamicRoutes() {
  console.log('generating routes...');
  routes = getPageModules().map((route) => {
    return {
      ...route,
      component: loadable(() => {
        return route.context(route.key).then((m) => m.default);
      }),
    };
  });
  routesGenerated = true;
  return routes;
}

export function getRoutes(plain) {
  let ret;
  if (routesGenerated) {
    console.log('routes generated, return from cache');
    ret = routes;
  } else {
    ret = generateDynamicRoutes();
  }
  if (plain) {
    ret = ret.map((route) => {
      return {
        ...route,
        component: null,
        context: null,
      };
    });
  }
  return ret;
}
