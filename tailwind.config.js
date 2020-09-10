module.exports = {
  purge: ['./src/**/*.js', './src/**/*.jsx', './views/*.html'],
  corePlugins: {
    float: false,
  },
  theme: {
    extend: {},
  },
  variants: {
    appearance: [],
  },
  plugins: [],
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
};
