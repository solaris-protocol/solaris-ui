/* eslint-disable react-hooks/rules-of-hooks,@typescript-eslint/no-var-requires */
const {
  useBabelRc,
  override,
  addWebpackModuleRule,
  addLessLoader,
} = require('customize-cra');

const isDev = process.env.NODE_ENV === 'development';

module.exports = override(
  useBabelRc(),
  addLessLoader({
    lessOptions: {
      modifyVars: { '@primary-color': '#2abdd2' },
      javascriptEnabled: true,
    },
  }),
  addWebpackModuleRule({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      { loader: 'babel-loader' },
      {
        loader: '@linaria/webpack-loader',
        options: {
          cacheDirectory: 'src/.linaria_cache',
          sourceMap: isDev,
        },
      },
    ],
  }),
  addWebpackModuleRule({
    test: /-icon\.svg$/,
    use: ['@svgr/webpack'],
  })
);
