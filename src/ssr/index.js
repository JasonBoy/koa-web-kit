import path from 'path';
import React from 'react';
import { StaticRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import manifest from '../../build/app/manifest.json';

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
// import Home from 'components/Home';
//
// const RouterApp = (
//   <StaticRouter location={}
//                 context={context}>
//
//   </StaticRouter>
// );

// function SSRDemo(props) {
//   return <div>ssr demo</div>;
// }

const defaultContext = {
  userName: 'ssr-jason',
};

class SSR {
  constructor() {
    this.statsFile = path.resolve('build/loadable-stats.json');
    console.log('this.statsFile: ', this.statsFile);
    // this.extractor = new ChunkExtractor({ statsFile: this.statsFile });
  }

  renderHome(url) {
    console.log('url: %s', url);
    return this.render(url, {});
  }

  renderGithub(url, data) {
    console.log(data);
    return this.render(url, data);
  }

  render(url, data, routerContext = {}) {
    // let modules = [];
    const extractor = new ChunkExtractor({ statsFile: this.statsFile });
    const jsx = extractor.collectChunks(
      <StaticRouter location={url} context={routerContext}>
        <AppRoutes context={defaultContext} initialData={data} />
      </StaticRouter>
    );
    const html = ReactDOMServer.renderToString(jsx);
    // You can now collect your script tags
    const renderedScriptTags = extractor.getScriptTags(); // or extractor.getScriptElements();
    // You can also collect your "preload/prefetch" links
    const renderedLinkTags = extractor.getLinkTags(); // or extractor.getLinkElements();
    // And you can even collect your style tags (if you use "mini-css-extract-plugin")
    const renderedStyleTags = extractor.getStyleTags(); // or extractor.getStyleElements();
    /*console.log('html: ', html);
    console.log('renderedScriptTags: \n', renderedScriptTags);
    console.log('renderedLinkTags: \n', renderedLinkTags);
    console.log('renderedStyleTags: \n', renderedStyleTags);*/
    return {
      html,
      extractor,
      scriptTags: renderedScriptTags,
      linkTags: renderedLinkTags,
      styleTags: renderedStyleTags,
    };
  }

  renderWithStream(url, data = {}, routerContext = {}) {
    // let modules = [];
    const extractor = new ChunkExtractor({ statsFile: this.statsFile });
    const jsx = extractor.collectChunks(
      <StaticRouter location={url} context={routerContext}>
        <AppRoutes context={defaultContext} initialData={data} />
      </StaticRouter>
    );
    const htmlStream = ReactDOMServer.renderToNodeStream(jsx);
    const renderedScriptTags = extractor.getScriptTags();
    const renderedLinkTags = extractor.getLinkTags();
    const renderedStyleTags = extractor.getStyleTags();
    /*console.log('renderedScriptTags: \n', renderedScriptTags);
    console.log('renderedLinkTags: \n', renderedLinkTags);
    console.log('renderedStyleTags: \n', renderedStyleTags);*/
    return {
      htmlStream,
      extractor,
      scriptTags: renderedScriptTags,
      linkTags: renderedLinkTags,
      styleTags: renderedStyleTags,
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
    return Promise.resolve();
    // return Loadable.preloadAll();
  }
}

export default SSR;
