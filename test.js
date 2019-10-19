import test from 'ava'
import fs from 'fs'
import fsextra from 'fs-extra'

const somedir1 = './test-data-copy/tdir/somedir1'
const somedir2 = './test-data-copy/tdir/somedir2'
const somedir3 = './test-data-copy/tdir/somedir3'

// const template = './test-data-copy/test.template.html'
const target = './test-data-copy/tdir/index.html'

const injects = {
  title: '___title___',
  keyOne: '___keyOne____'
}

// const localesDir = './test-data-copy/locales'
const cleanableDir = './test-data-copy/cleanable/'

test('#copyAssets()', (t) => {
  t.is(fs.existsSync('./test-data-copy'), true)
})

test('#prepareDirectories()', (t) => {
  t.is(fs.existsSync(somedir1), true)
  t.is(fs.existsSync(somedir2), true)
  t.is(fs.existsSync(somedir3), true)
})

test('#htmlInjector()', (t) => {
  const html = fs.readFileSync(target)
  t.is(html.indexOf(injects.title) > -1, true)
  t.is(html.indexOf(injects.keyOne) > -1, true)
})

test('#emptyDirectories()', (t) => {
  t.is(fs.existsSync(cleanableDir + 'test.txt'), false)
})

test('#i18nBundler()', (t) => {
  const output = require('./test-data-copy/output.js')
  t.is(output.te.test.willbeRemoved, undefined)
  t.is(output.te.test.willbeAdded, 'willbeAdded')
  t.is(output.te.test.willnotOverride, 'te text')
  t.is(output.en.test.willnotOverride, 'en text')
  t.is(output.te.onlyEng.wasInENonly, 'yes')
  t.deepEqual(fsextra.readJSONSync('./test-data-copy/locales/te/test.json'), {
    willnotOverride: 'te text',
    nested: {
      nested: {
        nested: {
          nested: {
            'some-key': 'some-value'
          }
        }
      }
    },
    'nested-2': {
      'nested-2': {
        'nested-3': {
          'nested-4': {
            key: 'value'
          }
        }
      }
    },
    willbeAdded: 'willbeAdded'
  })
  t.deepEqual(fsextra.readJSONSync('./test-data-copy/locales/te/onlyEng.json'), {
    wasInENonly: 'yes'
  })
  t.falsy(fsextra.pathExistsSync('./test-data-copy/locales/te/only-in-te.json'))
})

test.after(() => {
  // fsextra.removeSync('./test-data-copy')
})
