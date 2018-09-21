const fs = require('fs');
const path = require('path');
const fromString = require('from2-string');
const { Transform } = require('stream');

const config = require('../config/env');
const utils = require('../config/utils');
const { logger } = require('./logger');

const Cache = require('./Cache');

const isSSREnabled = config.isSSREnabled();
const isHMREnabled = config.isHMREnabled();
const ENTRY_NAME = utils.ENTRY_NAME;
const publicPath = utils.getPublicPath();
const DEV_MODE = config.isDevMode();

let indexHtml = '';
let s;
let manifest;
let groupedManifest;
let styleLinks = '';
let manifestInlineScript = '';
let vendorsScript = '';

if (isSSREnabled) {
  const SSR = require('../build/node/ssr');
  groupedManifest = SSR.groupedManifest;
  manifest = groupedManifest.manifest;
  // console.log('manifest: ', manifest);
  const appCss = groupedManifest.manifest[`${utils.ENTRY_NAME.APP}.css`];
  // console.log('appCss: ', appCss);
  // console.log('groupedManifest.styles: ', groupedManifest.styles);

  styleLinks = groupedManifest.styles
    ? groupedManifest.styles
        .map(style => {
          //inline app css
          // if (!DEV_MODE && appCss === style) {
          //   return `<style>${fs.readFileSync(
          //     path.join(__dirname, '../build/app/' + style)
          //   )}</style>`;
          // }
          return `<link href="${publicPath}${style}" rel="stylesheet">`;
        })
        .join('\n')
    : '';
  // console.log('styleLinks: ', styleLinks);
  if (manifest[ENTRY_NAME.RUNTIME_JS]) {
    manifestInlineScript = `<script type="text/javascript" src="${publicPath +
      manifest[ENTRY_NAME.RUNTIME_JS]}"></script>`;
  }
  if (manifest[ENTRY_NAME.VENDORS_JS]) {
    vendorsScript = `<script type="text/javascript" src="${publicPath +
      manifest[ENTRY_NAME.VENDORS_JS]}"></script>`;
  }

  // if (!DEV_MODE) {
  //   const temp = fs.readFileSync(
  //     path.join(__dirname, `../build/app/${manifest[ENTRY_NAME.RUNTIME_JS]}`),
  //     { encoding: 'utf-8' }
  //   );
  //   manifestInlineScript = `<script type="text/javascript">${temp}</script>`;
  // }

  s = new SSR();
} else if (!isHMREnabled) {
  try {
    indexHtml = fs.readFileSync(
      path.join(__dirname, `../build/app/index.html`),
      {
        encoding: 'utf-8',
      }
    );
  } catch (e) {
    logger.error('failed to read build/app/index.html...');
    // console.error(e);
  }
}

/**
 * Renderer to render React SSR contents or just static html in koa app's routes
 */
class ServerRenderer {
  /**
   * ServerRenderer class
   * @param options like below:
   * {
   *   ssr: true, //enable/disable SSR manually, if provided, will use the app config
   *   cache: {Cache}, instance of custom Cache,
   *   streaming: true, if default to use streaming api
   * }
   */
  constructor(options = {}) {
    this.ssrEnabled = options.hasOwnProperty('ssr')
      ? !!options.ssr
      : isSSREnabled;
    this.cache = options.cache || (this.ssrEnabled ? new Cache(options) : null);
    this.streaming = !!options.streaming;
  }

  /**
   * Check if SSR is enabled
   * @return {boolean|*}
   */
  isSSREnabled() {
    return this.ssrEnabled;
  }

  /**
   * Render static html content or Server side rendering components
   * @param {object} ctx koa ctx
   * @param {object=} data initial data
   * @param {Boolean=} streaming whether to user streaming api or not
   */
  render(ctx, data = {}, streaming) {
    if (!this.ssrEnabled) {
      ctx.body = this.genHtml('', {}, ctx);
      return;
    }

    this.renderSSR(ctx, data, streaming);
  }

  /**
   * Render content from cache
   * @param key {string} cache key
   * @param ctx {object} koa ctx object
   */
  renderFromCache(key, ctx) {
    logger.info('Rendering content from cache...');
    this.setHtmlContentType(ctx);
    ctx.body = this.cache.get(key);
  }

  /**
   * Server side rendering components
   * @param {object} ctx koa ctx
   * @param {object=} data initial data
   * @param {Boolean=} streaming whether to user streaming api or not
   */
  renderSSR(ctx, data = {}, streaming = this.streaming) {
    this.setHtmlContentType(ctx);

    if (this.isCacheMatched(ctx.path)) {
      this.renderFromCache(ctx.path, ctx);
      return;
    }

    if (!streaming) {
      logger.info('-----> Use React SSR Sync API!');
      const rendered = s.render(ctx.url, data);
      rendered.initialData = data;
      ctx.body = this.genHtml(rendered.html, rendered, ctx);
      return;
    }
    logger.info('-----> Use React SSR Streaming API!');
    //use streaming api
    const rendered = s.renderWithStream(ctx.url, data);
    rendered.initialData = data;
    ctx.status = 200;
    ctx.respond = false;
    this.genHtmlStream(rendered.html, rendered, ctx);
  }

  /**
   * Generate static html from component
   * @param {string=} html SSRed html
   * @param {object=} extra extra info from SSR#render()
   * @param {object} ctx koa ctx object
   * @return {string} final html content
   */
  genHtml(html, extra = {}, ctx) {
    if (indexHtml) {
      return indexHtml;
    }

    const loadableComponents = extra.scripts || [];
    const renderedComponentsScripts = loadableComponents.join('');

    let ret = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
        <title>${extra.title || 'React App'}</title>
        ${styleLinks}
      </head>
      <body>
        <div id="app">${html}</div>
        <script type="text/javascript">window.__INITIAL_DATA__ = ${JSON.stringify(
          extra.initialData || {}
        )}</script>
        ${manifestInlineScript}
        ${vendorsScript}
        ${renderedComponentsScripts}
        <script type="text/javascript" src="${publicPath +
          manifest[ENTRY_NAME.APP_JS]}"></script>
      </body>
    </html>
  `;

    this.cache && this.cache.set(ctx.path, ret);
    return ret;
  }

  /**
   * Generate html in stream
   * @param nodeStreamFromReact
   * @param extra
   * @param ctx
   */
  genHtmlStream(nodeStreamFromReact, extra = {}, ctx) {
    const res = ctx.res;
    let cacheStream = this.createCacheStream(ctx.path);

    cacheStream.pipe(res);

    const before = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
        <title>${extra.title || 'React App'}</title>
        ${styleLinks}
      </head>
      <body><div id="app">`;

    cacheStream.write(before);

    nodeStreamFromReact.pipe(
      cacheStream,
      { end: false }
    );

    nodeStreamFromReact.on('end', () => {
      logger.info('nodeStreamFromReact end');
      logger.info('start streaming rest html content...');
      let renderedComponentsScripts = [];
      //get rendered components for react-loadable after reactNodeStream done
      if (extra.modules) {
        // console.log('extra.modules:', extra.modules);
        renderedComponentsScripts = s.getRenderedBundleScripts(extra.modules);
      }
      const after = `</div>
      <script type="text/javascript">window.__INITIAL_DATA__ = ${JSON.stringify(
        extra.initialData || {}
      )}</script>
        ${manifestInlineScript}
        ${vendorsScript}
        ${renderedComponentsScripts}
        <script type="text/javascript" src="${publicPath +
          manifest[ENTRY_NAME.APP_JS]}"></script>
      </body>
    </html>
  `;
      //in case the initial data and the runtime code is big, also use stream here
      const afterStream = fromString(after);
      afterStream.pipe(
        cacheStream,
        { end: false }
      );
      afterStream.on('end', () => {
        logger.info('streaming rest html content done!');
        cacheStream.end();
      });
    });
  }

  /**
   *
   * @param {String} key for now it's ctx.url
   */
  createCacheStream(key) {
    logger.info(`Creating cache stream for ${key}`);
    const bufferedChunks = [];
    const self = this;
    return new Transform({
      // transform() is called with each chunk of data
      transform(data, enc, cb) {
        // We store the chunk of data (which is a Buffer) in memory
        bufferedChunks.push(data);
        // Then pass the data unchanged onwards to the next stream
        cb(null, data);
      },

      // flush() is called when everything is done
      flush(cb) {
        // We concatenate all the buffered chunks of HTML to get the full HTML
        // then cache it at "key"
        self.cache.set(key, Buffer.concat(bufferedChunks));
        logger.info(`Cache stream for ${key} finished!`);
        cb();
      },
    });
  }

  /**
   * Check if provided key being found in the current cache pool
   * @param key
   * @return {boolean}
   */
  isCacheMatched(key) {
    if (this.cache && this.cache.has(key)) {
      logger.info(`Cache for [${key}] matched!`);
      return true;
    }
    return false;
  }

  /**
   * Set content-type for rendered html
   * @param ctx {object} koa ctx
   */
  setHtmlContentType(ctx) {
    ctx.set({
      'Content-Type': 'text/html',
    });
  }
}

module.exports = ServerRenderer;
