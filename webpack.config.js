const path = require('path');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: "./js/index.ts",
    output: {
        filename: "scene_presets_panel.js",
        path: path.resolve(__dirname, "custom_components/scene_presets/frontend")
    },
    resolve: {
        modules: [path.join(__dirname), 'node_modules'],
        extensions: [".webpack.js", ".web.js", ".ts", ".js", ".tsx"]
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" },
            { test: /\.tsx$/, loader: "ts-loader" },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },
    mode: "production"    
}