module.exports = function(api) {
  const DEV_MODE = api.env('development');
  api.cache(true);
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {},
          useBuiltIns: 'usage',
          modules: false,
          corejs: 3,
        },
      ],
      '@babel/preset-react',
    ],
    env: {
      development: {
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: DEV_MODE,
            },
          ],
          '@babel/plugin-transform-react-jsx-source',
        ],
      },
      test: {
        presets: [
          [
            '@babel/preset-env',
            {
              modules: false,
            },
          ],
          '@babel/preset-react',
        ],
        plugins: [
          [
            'babel-plugin-styled-components',
            {
              displayName: DEV_MODE,
            },
          ],
          '@babel/plugin-transform-react-jsx-source',
          'dynamic-import-node',
        ],
      },
    },
    plugins: [
      [
        'babel-plugin-styled-components',
        {
          displayName: DEV_MODE,
        },
      ],
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-modules-commonjs',
      '@loadable/babel-plugin',
      ['import', { libraryName: 'antd', libraryDirectory: 'es', style: 'css' }],
    ],
  };
};
