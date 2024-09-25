import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { type Configuration } from 'webpack';

const projectRoot = dirname(fileURLToPath(import.meta.url));

const webpackConfig: Configuration = {
  mode: 'production',
  context: projectRoot,
  entry: './src/main.ts',
  output: {
    path: `${projectRoot}/build/`,
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
};

export default webpackConfig;
