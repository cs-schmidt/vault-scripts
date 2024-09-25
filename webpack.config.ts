import 'dotenv/config';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import { type Configuration } from 'webpack';

const projectRoot = dirname(fileURLToPath(import.meta.url));
const buildDir = process.env['BUILD_DIR'] as string;

const webpackConfig: Configuration = {
  mode: 'production',
  context: projectRoot,
  entry: './src/main.ts',
  output: {
    path: buildDir,
    library: {
      type: 'commonjs',
    },
    clean: true,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        // TypeScript Module Rule
        test: /\.(?:[cm]?ts)$/,
        exclude: /node_modules/,
        use: ['ts-loader'],
      },
    ],
  },
  externals: ['obsidian'],
  plugins: [new CopyPlugin({ patterns: [{ from: 'manifest.json' }] })],
};

export default webpackConfig;
