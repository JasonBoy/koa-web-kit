const purgecss = require('@fullhuman/postcss-purgecss')({
  // Specify the paths to all of the template files in your project
  content: [
    './src/index.js',
    './src/ssr/index.js',
    './views/*.html',
    './src/**/*.jsx',
  ],

  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
});
const cssnano = require('cssnano');
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  plugins: [
    require('postcss-import'),
    require('tailwindcss'),
    require('postcss-preset-env')({ stage: 1 }),
    isProd ? cssnano({ preset: 'default' }) : null,
    ...(isProd ? [purgecss] : []),
  ],
};
