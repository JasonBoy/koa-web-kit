import path from 'path';
import { StaticRouter } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import { ChunkExtractor } from '@loadable/server';
import { ServerStyleSheet } from 'styled-components';
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
manifestKeys.forEach((key) => {
  const type = checkSourceType(key) || {};
  if (!groupedManifest.hasOwnProperty(type.name)) {
    groupedManifest[type.name] = [];
  }
  groupedManifest[type.name].push(manifest[key]);
});

// console.log('groupedManifest:', groupedManifest);

function checkSourceType(sourceKey) {
  let type;
  const matchedKey = typeKeys.find((t) => {
    const temp = SOURCE_TYPE[t];
    return temp.test.test(sourceKey);
  });
  if (matchedKey) {
    type = SOURCE_TYPE[matchedKey];
  }
  return type;
}

const defaultContext = {
  userName: 'ssr-jason',
};

class SSR {
  constructor() {
    this.statsFile = path.resolve('build/loadable-stats.json');
  }
  render(url, data, routerContext = {}) {
    // let modules = [];
    const sheet = new ServerStyleSheet();
    const extractor = new ChunkExtractor({ statsFile: this.statsFile });
    let jsx,
      html,
      renderedScriptTags,
      renderedLinkTags,
      renderedStyleTags,
      scStyleTags,
      styleTags;
    try {
      jsx = extractor.collectChunks(
        sheet.collectStyles(
          <StaticRouter location={url} context={routerContext}>
            <AppRoutes context={defaultContext} initialData={data} />
          </StaticRouter>,
        ),
      );
      html = ReactDOMServer.renderToString(jsx);

      // You can now collect your script tags
      renderedScriptTags = extractor.getScriptTags(); // or extractor.getScriptElements();
      // You can also collect your "preload/prefetch" links
      renderedLinkTags = extractor.getLinkTags(); // or extractor.getLinkElements();
      // And you can even collect your style tags (if you use "mini-css-extract-plugin")
      renderedStyleTags = extractor.getStyleTags(); // or extractor.getStyleElements();

      scStyleTags = sheet.getStyleTags();

      styleTags = `${renderedStyleTags || ''}${scStyleTags || ''}`;

      // console.log('html: ', html);
      // console.log('renderedScriptTags: \n', renderedScriptTags);
      // console.log('renderedLinkTags: \n', renderedLinkTags);
      // console.log('renderedStyleTags: \n', renderedStyleTags);
      // console.log('scStyleTags: \n', scStyleTags);
      // console.log('together StyledTags: \n', styleTags);
    } catch (err) {
      console.error(err);
    } finally {
      sheet.seal();
    }

    return {
      html,
      extractor,
      scriptTags: renderedScriptTags || '',
      linkTags: renderedLinkTags || '',
      styleTags: styleTags || '',
    };
  }

  renderWithStream(url, data = {}, routerContext = {}) {
    // let modules = [];
    const sheet = new ServerStyleSheet();
    const extractor = new ChunkExtractor({ statsFile: this.statsFile });
    const jsx = extractor.collectChunks(
      sheet.collectStyles(
        <StaticRouter location={url} context={routerContext}>
          <AppRoutes context={defaultContext} initialData={data} />
        </StaticRouter>,
      ),
    );
    const htmlStream = sheet.interleaveWithNodeStream(
      ReactDOMServer.renderToNodeStream(jsx),
    );
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
}

export default SSR;
