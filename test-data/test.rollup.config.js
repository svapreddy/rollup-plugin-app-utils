import Utils from '../src/index.js'

let somedir1 = './test-data-copy/tdir/somedir1'
let somedir2 = './test-data-copy/tdir/somedir2'
let somedir3 = './test-data-copy/tdir/somedir3'

let template = './test-data-copy/test.template.html'
let notFoundTemplate = './test-data-copy/test.does.not.exist.template.html'
let target = './test-data-copy/tdir/index.html'
let injects = {
  title: '___title___',
  keyOne: '___keyOne____'
}

let localesDir = './test-data-copy/locales'
let cleanableDir = './test-data-copy/cleanable/'

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
