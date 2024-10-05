import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const buildPath = process.env['BUILD_PATH'];

/** Webpack Configuration */
export default {
  mode: 'production',
  context: projectRoot,
  entry: './src/main.js',
  output: {
    path: buildPath,
    filename: '[name].js',
    libraryTarget: 'commonjs',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  externals: ['obsidian'],
  plugins: [new CopyPlugin({ patterns: [{ from: 'manifest.json' }] })],
};
