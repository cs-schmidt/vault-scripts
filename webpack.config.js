import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
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
    filename: 'main.js',
    library: { type: 'commonjs2' },
    clean: true,
  },
  module: {
    rules: [
      { test: /\.m?js$/, resolve: { fullySpecified: false } },
      { test: /\.css$/, use: [MiniCssExtractPlugin.loader, 'css-loader'] },
    ],
  },
  externals: ['obsidian'],
  plugins: [
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
    new CopyPlugin({ patterns: [{ from: 'manifest.json' }] }),
  ],
};
