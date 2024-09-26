import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const buildDir = process.env['BUILD_DIR'];

/** Webpack Configuration */
export default {
  mode: 'production',
  context: projectRoot,
  entry: './src/main.js',
  devtool: 'source-map',
  output: {
    path: buildDir,
    filename: '[name].js',
    libraryTarget: 'commonjs',
    clean: true,
  },
  externals: ['obsidian'],
  plugins: [new CopyPlugin({ patterns: [{ from: 'manifest.json' }] })],
};
