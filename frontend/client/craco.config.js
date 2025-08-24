    const webpack = require('webpack');

    module.exports = {
    webpack: {
        configure: (webpackConfig) => {
        // Configuration des fallbacks pour les modules Node.js
        webpackConfig.resolve.fallback = {
            ...webpackConfig.resolve.fallback,
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "zlib": require.resolve("browserify-zlib"),
            "stream": require.resolve("stream-browserify"),
            "url": require.resolve("url"),
            "buffer": require.resolve("buffer"),
            "util": require.resolve("util"),
            "assert": require.resolve("assert"),
            "process": require.resolve("process/browser"),
        };

        // Plugins pour fournir les variables globales
        webpackConfig.plugins = [
            ...webpackConfig.plugins,
            new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            process: 'process/browser',
            }),
        ];

        // Configuration pour ignorer les warnings de source maps
        webpackConfig.ignoreWarnings = [
            /Failed to parse source map/,
        ];

        return webpackConfig;
        },
    },
    };