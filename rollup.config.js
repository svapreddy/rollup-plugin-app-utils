import path from 'path'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import license from 'rollup-plugin-license'
import filesize from 'rollup-plugin-filesize'
import standard from 'rollup-plugin-standard'
import builtins from 'builtin-modules'

const packageJSON = require('./package.json')

const config = {
  name: packageJSON.name
}

const bundleName = config.name

const defaultConfig = [{
  input: 'src/index.js',
  external: builtins,
  plugins: [
    standard(),
    commonjs({
      include: 'node_modules/**',
      ignore: ['fs', 'stream', 'path', 'assert', 'util', 'os']
    }),
    resolve({
      include: 'node_modules/**',
      extensions: ['.js']
    }),
    buble({
      objectAssign: 'Object.assign'
    }),
    license({
      sourceMap: true,
      cwd: '.', // Default is process.cwd()
      banner: {
        file: path.join(__dirname, 'build.inputs/LICENSE.txt'),
        encoding: 'utf-8', // Default is utf-8
        // Optional, may be an object or a function returning an object.
        data () {
          return config
        }
      }
    }),
    filesize()
  ],
  output: [
    {
      sourcemap: true,
      file: `./dist/${bundleName}.js`,
      format: 'cjs'
    },
    {
      sourcemap: true,
      file: `./dist/${bundleName}.es.js`,
      format: 'esm'
    }
  ],
  watch: {
    chokidar: true
    // clearScreen: true,
    // include: 'src/**'
  }
}]

export default commandLineArgs => {
  return defaultConfig
}
