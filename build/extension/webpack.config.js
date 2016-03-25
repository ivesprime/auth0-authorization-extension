const _ = require('lodash');
const path = require('path');
const Webpack = require('webpack');
const externalModules = require('./externals');

module.exports = externalModules.then((externals) => {
  // Remove client side dependencies that are incorrectly marked as incompatible.
  Object.keys(externals.incompatible).forEach(key => {
    if (key.indexOf('babel') === 0 || key.indexOf('webpack') === 0 || key.indexOf('react') === 0 || key.indexOf('postcss') === 0) {
      externals.compatible[key] = true;
      delete externals.incompatible[key];
    }
  });

  /* // List incompatible modules.
  Object.keys(externals.incompatible).sort().forEach(key => {
    const module = externals.incompatible[key];
    console.log(` ${key} - Local: ${module.local.join(', ')} - Webtask: ${module.webtask}`);
  }); */
  
  // Even though we don't have an semver match, it's ok to use these versions.
  externals.compatible['async'] = true; // Local: ^0.9.0, ^1.5.0, ^1.4.0, ^1.5.2, ~0.2.9, ~0.2.6, ^1.3.0, ~1.0.0, ~1.5.2 - Webtask: 1.0.0
  externals.compatible['aws-sdk'] = true; // Local: ^2.2.47 - Webtask: 2.2.30
  externals.compatible['aws-sign2'] = true; // Local: ~0.6.0 - Webtask: 0.5.0
  externals.compatible['bluebird'] = true; // Local: ^2.10.2, ^2.3, ^3.1.1, ^3.3.4 - Webtask: 2.9.26
  externals.compatible['compression'] = true; // Local: ^1.5.2 - Webtask: 1.4.4
  externals.compatible['delegates'] = true; // Local: ^1.0.0 - Webtask: 0.1.0
  externals.compatible['depd'] = true; // Local: ~1.1.0 - Webtask: 1.0.1
  externals.compatible['destroy'] = true; // Local: ~1.0.4 - Webtask: 1.0.3
  externals.compatible['ejs'] = true; // Local: ^2.4.1 - Webtask: 2.3.1
  externals.compatible['express'] = true; // Local: ^4.13.3, ~4.11.0, ~4.13.1, ~3*, <3, 2.5.8, ^4.12.3, ^4.12.0, ^4.13.4 - Webtask: 4.12.4
  externals.compatible['express-jwt'] = true; // Local: ^3.1.0, ^3.3.0 - Webtask: 3.1.0
  externals.compatible['iconv-lite'] = true; // Local: 0.4.13 - Webtask: 0.4.10
  externals.compatible['lodash'] = true; // Local: ^3.10.0, ^3.10.1, ^4.6.1, ^4.0.0, ~3.10.1, ^4.3.0, ~4.5.1, ^4.1.0, ^4.2.0, ^4.2.1, ^4.5.0, ~3.5.0 - Webtask: 3.10.1
  externals.compatible['lru-cache'] = true; // Local: ^4.0.0, ~4.0.0, 2 - Webtask: 2.6.4
  externals.compatible['mime-db'] = true; // Local: >= 1.21.0 < 2, ~1.22.0 - Webtask: 1.10.0
  externals.compatible['moment'] = true; // Local: ^2.12.0 - Webtask: 2.10.3
  externals.compatible['mongo-getdb'] = true; // Local: ^2.0.0 - Webtask: 1.4.0
  externals.compatible['morgan'] = true; // Local: ~1.5.1, ~1.6.1, ^1.5.2, ^1.7.0 - Webtask: 1.5.3
  externals.compatible['ms'] = true; // Local: 0.7.1, ^0.7.1 - Webtask: 0.7.1
  externals.compatible['qs'] = true; // Local: 6.1.0, 4.0.0, ~6.0.2, 2.3.3 - Webtask: 3.1.0
  externals.compatible['raw-body'] = true; // Local: ~2.1.5 - Webtask: 2.1.0
  externals.compatible['read-all-stream'] = true; // Local: ^3.0.0 - Webtask: 2.1.2
  externals.compatible['request'] = true; // Local: 2.x, ^2.34, ^2.69.0 - Webtask: 2.56.0
  externals.compatible['superagent'] = true; // Local: ^1.1.0, ^1.4.0, ^1.7.2 - Webtask: 1.2.0
  externals.compatible['type-check'] = true; // Local: ~0.3.2 - Webtask: 0.3.1
  externals.compatible['winston'] = true; // Local: ^2.2.0 - Webtask: 1.0.0
  externals.compatible['xml2js'] = true; // Local: 0.4.15 - Webtask: 0.4.8

  // Modules we still need in webtask.
  externals.compatible['auth0'] = true;
  externals.compatible['nconf'] = true;
  externals.compatible['validate.js'] = true;

  return {
    entry: path.join(__dirname, '../../webtask'),
    target: 'node',
    output: {
      path: './build',
      filename: 'bundle.js',
      library: true,
      libraryTarget: 'commonjs2'
    },
    externals: externals.compatible,
    module: {
      loaders: [
        {
          test: /\.jsx?$/,
          loader: 'babel',
          exclude: path.join(__dirname, '../../node_modules/')
        },
        { test: /\.json$/, loader: 'json' }
      ]
    },
    plugins: [
      new Webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production')
        }
      }),
      new Webpack.optimize.DedupePlugin(),
      new Webpack.optimize.UglifyJsPlugin({
        minimize: true,
        mangle: true,
        output: {
          comments: false
        },
        compress: {
          sequences: true,
          dead_code: true,
          conditionals: true,
          booleans: true,
          unused: true,
          if_return: true,
          join_vars: true,
          drop_console: true,
          warnings: false
        }
      })
    ],
    resolve: {
      modulesDirectories: [ 'node_modules', path.join(__dirname, '../../node_modules/') ],
      root: __dirname,
      alias: {}
    },
    node: false
  };
});