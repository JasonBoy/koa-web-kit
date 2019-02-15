module.exports = function(api) {
  api.cache(true);

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {},
          useBuiltIns: 'usage',
          modules: false,
        },
      ],
      '@babel/preset-react',
    ],
    env: {
      development: {
        plugins: ['@babel/plugin-transform-react-jsx-source'],
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
          '@babel/plugin-transform-react-jsx-source',
          'dynamic-import-node',
        ],
      },
    },
    plugins: [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-modules-commonjs',
      '@loadable/babel-plugin',
    ],
  };
};
