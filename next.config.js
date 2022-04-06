const withSass = require('@zeit/next-sass');
const withCSS = require('@zeit/next-css');
const webpack = require('webpack');
const withBundleAnalyzer = require('@zeit/next-bundle-analyzer');
const withBabelMinify = require('next-babel-minify')();
require('dotenv').config()

module.exports = withCSS(withSass({
    distDir: 'next',
    analyzeServer: ['server', 'both'].includes(process.env.BUNDLE_ANALYZE),
    analyzeBrowser: ['browser', 'both'].includes(process.env.BUNDLE_ANALYZE),
    bundleAnalyzerConfig: {
        server: {
            analyzerMode: 'static',
            reportFilename: '../bundles/server.html'
        },
        browser: {
            analyzerMode: 'static',
            reportFilename: './bundles/client.html'
        }
    },
    webpack(config, { isServer }) {
        config.module.rules.push({
            test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
            use: {
                loader: 'url-loader',
                options: {
                    limit: 100000
                }
            }
        })

        config.plugins.push(
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new webpack.EnvironmentPlugin(process.env)
        )

        return config
    }
}));