import test from 'ava'
import fs from 'fs'
import fsextra from 'fs-extra'

let somedir1 = './test-data-copy/tdir/somedir1'
let somedir2 = './test-data-copy/tdir/somedir2'
let somedir3 = './test-data-copy/tdir/somedir3'

let template = './test-data-copy/test.template.html'
let target = './test-data-copy/tdir/index.html'

let injects = {
  title: '___title___',
  keyOne: '___keyOne____'
}

let localesDir = './test-data-copy/locales'
let cleanableDir = './test-data-copy/cleanable/'

test('#copyAssets()', (t) => {
  t.is(fs.existsSync('./test-data-copy'), true)
})

test('#prepareDirectories()', (t) => {
  t.is(fs.existsSync(somedir1), true)
  t.is(fs.existsSync(somedir2), true)
  t.is(fs.existsSync(somedir3), true)
})

test('#htmlInjector()', (t) => {
  let html = fs.readFileSync(target)
  t.is(html.indexOf(injects.title) > -1, true)
  t.is(html.indexOf(injects.keyOne) > -1, true)
})

test('#emptyDirectories()', (t) => {
  t.is(fs.existsSync(cleanableDir + 'test.txt'), false)
})

test('#i18nBundler()', (t) => {
  let output = require('./test-data-copy/output.js')
  t.is(output.te.test.willbeRemoved, undefined)
  t.is(output.te.test.willbeAdded, 'willbeAdded')
  t.is(output.te.test.willnotOverride, 'te text')
  t.is(output.en.test.willnotOverride, 'en text')
  t.is(output.te.onlyEng.wasInENonly, 'yes')
})

test.after(() => {
  // fsextra.removeSync('./test-data-copy')
})
