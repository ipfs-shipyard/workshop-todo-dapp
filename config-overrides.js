/* eslint-disable prefer-import/prefer-import-over-require */

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// The changes below are necessary to for having IPFS work with CRA when doing a production build
// Read https://github.com/ipfs/js-ipfs/issues/1321 for more details
module.exports = (config, env) => {
    if (env !== 'production') {
        return config;
    }

    // Replace old uglify-js with newest uglify-es
    // The uglify options were copied from https://github.com/facebook/create-react-app/blob/69c3d4b04c233ba9fb9d16691056bd09076177b1/packages/react-scripts/config/webpack.config.prod.js#L119
    const uglifyJsPluginIndex = config.plugins.findIndex((plugin) => plugin.constructor.name === 'UglifyJsPlugin');

    config.plugins.splice(uglifyJsPluginIndex, 1, new UglifyJsPlugin({
        uglifyOptions: {
            parse: {
                // We want uglify-js to parse ecma 8 code. However, we don't want it
                // to apply any minfication steps that turns valid ecma 5 code
                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                // sections only apply transformations that are ecma 5 safe
                // https://github.com/facebook/create-react-app/pull/4234
                ecma: 8,
            },
            compress: {
                // Needed to minify js-ipfs, see: https://github.com/ipfs/aegir/pull/214
                unused: false,
                ecma: 5,
                warnings: false,
                // Disabled because of an issue with Uglify breaking seemingly valid code:
                // https://github.com/facebook/create-react-app/issues/2376
                // Pending further investigation:
                // https://github.com/mishoo/UglifyJS2/issues/2011
                comparisons: false,
            },
            mangle: {
                safari10: true,
            },
            output: {
                ecma: 5,
                comments: false,
                // Turned on because emoji and regex is not minified properly using default
                // https://github.com/facebook/create-react-app/issues/2488
                ascii_only: true, // eslint-disable-line camelcase
            },
        },
        // Use multi-process parallel running to improve the build speed
        // Default number of concurrent runs: os.cpus().length - 1
        parallel: true,
        // Enable file caching
        cache: true,
        sourceMap: true,
    }));

    return config;
};
