const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpackNodeExternals = require('webpack-node-externals')

module.exports = {
    entry: './src',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.bundle.js',
        // filename: 'app.bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ],
    },
    stats: {
        colors: true
    },
    plugins: [
        new CleanWebpackPlugin(),
    ],
    // externals: [webpackNodeExternals()],
    target: 'node'
}
