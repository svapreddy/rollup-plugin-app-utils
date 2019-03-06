import colors from 'ansi-colors'
import log from 'log-utils'
import fsextra from 'fs-extra'

let emptyDirectories = (directories) => {
  return {
    buildStart () {
      if (typeof directories === 'string') {
        directories = [directories]
      }
      console.log(colors.bold.underline.cyan(`\nCleaning directories`))
      directories.forEach((dir) => {
        try {
          fsextra.emptyDirSync(dir)
          console.log(colors.green(`  ${log.success} ${dir}`))
        } catch (ex) {
          console.log(colors.green(`  ${log.error} ${dir}`))
          console.log(ex)
        }
      })
    }
  }
}

export default emptyDirectories
