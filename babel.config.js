module.exports = {
  presets: [['react-app', { flow: false, typescript: true }], '@linaria'],
  plugins: [
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          constants: './src/constants',
          utils: './src/utils',
          types: './src/types',
          app: './src/app',
          hooks: './src/hooks',
          pages: './src/pages',
          components: './src/components',
          styles: './src/styles',
          assets: './src/assets',
        },
      },
    ],
  ],
};
