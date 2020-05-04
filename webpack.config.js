const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpackNodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'index.js'
  },
  module: {
    rules: [{ test: /\.js$/, use: 'babel-loader' }],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  externals: [webpackNodeExternals()],
  target: 'node'
}
