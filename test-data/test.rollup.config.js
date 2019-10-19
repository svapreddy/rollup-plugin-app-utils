import Utils from '../src/index.js'

const somedir1 = './test-data-copy/tdir/somedir1'
const somedir2 = './test-data-copy/tdir/somedir2'
const somedir3 = './test-data-copy/tdir/somedir3'

const template = './test-data-copy/test.template.html'
const notFoundTemplate = './test-data-copy/test.does.not.exist.template.html'
const target = './test-data-copy/tdir/index.html'
const injects = {
  title: '___title___',
  keyOne: '___keyOne____'
}

const localesDir = './test-data-copy/locales'
// const cleanableDir = './test-data-copy/cleanable/'

const outputOptions = {
  file: './test-data-copy/output.js',
  format: 'cjs'
}

// see below for details on the options
const config = {
  input: './test-data/input.js',
  plugins: [
    Utils.copyAssets({
      './test-data': './test-data-copy'
    }),
    Utils.prepareDirectories(somedir1),
    Utils.prepareDirectories([somedir2, somedir3]),
    Utils.htmlInjector({
      template: template,
      target: target,
      injects: injects
    }),
    Utils.htmlInjector({
      template: notFoundTemplate,
      target: target,
      injects: injects
    }),
    Utils.i18nBundler({
      target: localesDir,
      baseLanguage: 'en',
      // Optional
      transformer: (lang, data) => {
        return data
      }
    }),
    Utils.emptyDirectories('./test-data-copy/cleanable/')
  ],
  output: outputOptions
}

export default commandLineArgs => {
  return config
}
