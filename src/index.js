import emptyDirectories from './modules/clean-dir'
import prepareDirectories from './modules/prepare-dir'
import htmlInjector from './modules/html-injects'
import i18nBundler from './modules/i18n-bundle'
import copyAssets from './modules/copy-assets'

export default {
  emptyDirectories,
  prepareDirectories,
  htmlInjector,
  i18nBundler,
  copyAssets
}
