import colors from 'ansi-colors'
import log from 'log-utils'
import fsextra from 'fs-extra'

const copyAssets = (obj, filterFunc) => {
  return {
    buildStart () {
      const filterConfig = filterFunc ? { filter: filterFunc } : undefined
      console.log(colors.bold.underline.cyan('\nCopying assets'))
      for (const p in obj) {
        fsextra.copySync(p, obj[p], filterConfig)
        console.log(colors.green(`  ${log.success} ${p} -> ${obj[p]}`))
      }
    }
  }
}

export default copyAssets
