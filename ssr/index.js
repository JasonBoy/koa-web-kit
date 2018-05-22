import React from 'react';
import { StaticRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';
import stats from '../build/react-loadable.json';
import manifest from '../build/app/manifest.json';

import AppRoutes from 'src/AppRoutes';

const SOURCE_TYPE = {
  STYLE: {
    name: 'styles',
    test: /\.css$/,
  },
  SCRIPT: {
    name: 'scripts',
    test: /\.js$/,
  },
  SOURCE_MAP: {
    name: 'sourceMap',
    test: /\.map$/,
  },
  IMAGE: {
    name: 'images',
    test: /\.(png|jpe?g|gif|svg)$/,
  },
};
const typeKeys = Object.keys(SOURCE_TYPE);

const groupedManifest = {
  manifest,
};

const manifestKeys = Object.keys(manifest);
manifestKeys.forEach(key => {
  const type = checkSourceType(key) || {};
  if (!groupedManifest.hasOwnProperty(type.name)) {
    groupedManifest[type.name] = [];
  }
  groupedManifest[type.name].push(manifest[key]);
});

// console.log('groupedManifest:', groupedManifest);

function checkSourceType(sourceKey) {
  let type;
  const matchedKey = typeKeys.find(t => {
    const temp = SOURCE_TYPE[t];
    return temp.test.test(sourceKey);
  });
  if (matchedKey) {
    type = SOURCE_TYPE[matchedKey];
  }
  return type;
}

// import Hello2 from 'components/Hello2';
// import Hello from 'components/Hello';
import Home from 'components/Home';
//
// const RouterApp = (
//   <StaticRouter location={}
//                 context={context}>
//
//   </StaticRouter>
// );

function SSRDemo(props) {
  return <div>ssr demo</div>;
}

const defaultContext = {
  userName: 'ssr-jason',
};

class SSR {
  constructor() {}

  renderHome(url) {
    console.log('url: %s', url);
    return this.render(url, {});
  }

  renderGithub(url, data) {
    console.log(data);
    return this.render(url, data);
  }

  render(url, data, routerContext = {}) {
    let modules = [];
    const html = ReactDOMServer.renderToString(
      <Loadable.Capture report={moduleName => modules.push(moduleName)}>
        <StaticRouter location={url} context={routerContext}>
          <AppRoutes context={defaultContext} initialData={data} />
        </StaticRouter>
      </Loadable.Capture>
    );
    let bundles = getBundles(stats, modules);
    console.log('modules:', modules);
    console.log('bundles:', bundles);
    // console.log('html:', html);
    return {
      html,
      scripts: this.generateBundleScripts(bundles),
    };
  }

  generateBundleScripts(bundles) {
    return bundles
      .filter(bundle => bundle && bundle.file.endsWith('.js'))
      .map(bundle => {
        return `<script type="text/javascript" src="${__pathPrefix__}${
          bundle.file
        }"></script>\n`;
      });
  }

  static get groupedManifest() {
    return groupedManifest;
  }

  static preloadAll() {
    return Loadable.preloadAll();
  }
}

export default SSR;
