const path = require('path');
const MonacoPlugin = require("monaco-editor-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: 'https://tiveqq.github.io/resolution-method/dist/'
    },
    resolve: {
        fallback: {
            fs: false
        }
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
        ]
    },
    plugins: [new MonacoPlugin({languages: []})]
};