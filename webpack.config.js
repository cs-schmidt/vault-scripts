import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const outputPath = process.env['BUILD_PATH'];

/** Webpack Configuration */
export default {
  mode: 'production',
  context: projectRoot,
  entry: './src/main.js',
  output: {
    path: outputPath,
    filename: '[name].js',
    library: { type: 'commonjs2' },
    clean: true,
  },
  module: {
    rules: [{ test: /\.m?js$/, resolve: { fullySpecified: false } }],
  },
  externals: ['obsidian'],
  plugins: [new CopyPlugin({ patterns: [{ from: 'manifest.json' }] })],
};
