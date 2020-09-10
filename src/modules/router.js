export function getPageModules() {
  const context = require.context('src/pages', true, /\.jsx?$/, 'lazy');
  console.log('context.keys(): ', context.keys());
  const modules = context.keys().map((key) => {
    // ./sub/sub2/sub3-module.jsx
    return {
      module: context(key),
      ...normalizeModulePath(key),
    };
  });
  // console.log('modules: ', modules);
  return modules;
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
    path: [...parts.slice(0, parts.length - 1), moduleName].join('/'),
    dir: withoutRoot,
    fullPath: path,
  };
}
