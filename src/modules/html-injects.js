import colors from 'ansi-colors'
import log from 'log-utils'
import fs from 'fs'
import fsextra from 'fs-extra'
import format from 'string-template'

const htmlInjector = (options) => {
  return {
    generateBundle () {
      const template = options.template
      const target = options.target
      if (fs.existsSync(template)) {
        let content = fs.readFileSync(template, 'utf-8')
        content = format(content, options.injects)
        fsextra.ensureFileSync(target)
        fs.writeFileSync(target, content)
        console.log(colors.green(`\n${log.success} HTML Injector: ${target}`))
      } else {
        console.log(colors.red(`\n${log.error} HTML Injector: ${template}`))
      }
    }
  }
}

export default htmlInjector
