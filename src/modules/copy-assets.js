import colors from 'ansi-colors'
import log from 'log-utils'
import fsextra from 'fs-extra'

let copyAssets = (obj, filterFunc) => {
  return {
    buildStart () {
      let filterConfig = filterFunc ? { filter: filterFunc } : undefined
      console.log(colors.bold.underline.cyan(`\nCopying assets`))
      for (let p in obj) {
        fsextra.copySync(p, obj[p], filterConfig)
        console.log(colors.green(`  ${log.success} ${p} -> ${obj[p]}`))
      }
    }
  }
}

export default copyAssets
