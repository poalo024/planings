const path = require('path');

module.exports = {
// Autres configurations...
resolve: {
fallback: {
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "zlib": require.resolve("browserify-zlib"),
    "stream": require.resolve("stream-browserify"),
    "url": require.resolve("url"),
    "buffer": require.resolve("buffer"),
    "util": require.resolve("util")
}
},
plugins: [
// Vos autres plugins...
new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
    process: 'process/browser',
}),
]
};