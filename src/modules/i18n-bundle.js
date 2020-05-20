import log from 'log-utils'
import colors from 'ansi-colors'
import path from 'path'
import fsextra from 'fs-extra'
import fs from 'fs'
import { createPatch, applyPatch } from 'rfc6902'
import objectPath from 'object-path'

const walk = ({ dir, filter, relativeTo, list = {}, depth = 0 }) => {
  const files = fs.readdirSync(dir)
  ++depth
  for (const i in files) {
    const file = files[i]
    const _file = path.join(dir, file)
    if (fs.statSync(_file).isDirectory()) {
      walk({
        dir: _file,
        filter,
        relativeTo: depth === 1 ? _file : relativeTo,
        depth,
        list: depth === 1 ? list[file] = {} : list
      })
    } else if ((filter.indexOf(path.extname(_file)) > -1) && depth > 1) {
      list[path.relative(relativeTo, _file)] = JSON.parse(fs.readFileSync(_file, 'utf-8'))
    }
  }
  return list
}

const i18n = (options) => {
  const { target, baseLanguage, transformer, skipBackFilling } = options

  const transform = transformer || ((lang, data) => {
    return { translations: data }
  })

  const data = walk({
    dir: target,
    filter: ['.json'],
    relativeTo: target,
    base: baseLanguage
  })

  const base = data[baseLanguage]

  const patches = {}
  const result = {}

  for (const lang in data) {
    const langJson = data[lang]
    if ((baseLanguage !== lang) && !skipBackFilling) {
      let patch = createPatch(langJson, base)
      patch = patch.filter((change) => {
        return change.op !== 'replace'
      })
      patches[lang] = patch
      applyPatch(langJson, patch)
    }

    const translations = {}

    for (const file in langJson) {
      const parsed = path.parse(file)
      const key = path.join(parsed.dir, parsed.name).split(path.sep)
      objectPath.set(translations, key, langJson[file])
    }

    result[lang] = transform(lang, translations)
  }

  const languageList = Object.keys(result).join(', ')

  console.log(colors.bold('\nLanguages found:'), colors.green(`${languageList}`))

  if (!skipBackFilling) {
    for (const lang in patches) {
      if (patches[lang].length > 0) {
        console.log(colors.bold(`\nLanguage: "${lang}" changes report`))
      }

      for (let i = 0; i < patches[lang].length; i++) {
        const patch = patches[lang][i]
        let message = ''

        let key = null
        let location = patch.path.substring(1).replace(/(~1)/g, '/')
        const split = location.split('.json')
        if (split[1]) {
          key = split[1].substring(1)
        }

        location = path.join(target, lang, `${split[0]}.json`)
        location = path.join(target, path.relative(target, location))

        let content
        if (patch.op === 'add') {
          const value = patch.value
          if (key && value) {
            content = fsextra.readJsonSync(location)
            objectPath.set(content, key.split('/'), value)
            message = `${log.success} ${key} with the value from ${baseLanguage} is added to the file: ${location}`
          } else {
            message = `${log.success} ${location} is created. Used the content from base language: ${baseLanguage}`
            content = value
          }
          fsextra.writeJSONSync(location, content, { spaces: '\t' })
        } else if (patch.op === 'remove') {
          if (key) {
            message = `${log.error} The key ${key} is deleted from the file: ${location}`
            content = fsextra.readJsonSync(location)
            objectPath.del(content, key.split('/'))
            fsextra.writeJSONSync(location, content, { spaces: '\t' })
          } else {
            message = `${log.error} Removing the file ${location}. It does not exist in base language(${baseLanguage}) folder`
            fs.unlinkSync(location)
          }
        }

        console.log(colors.grey(`   ${message}`))
      }
    }
    const patchedLanguages = Object.keys(patches)
    if (patchedLanguages.length > 0) {
      console.log(colors.bold(`\nFiles at "${patchedLanguages.join(', ')}" are updated to match "${baseLanguage}"`))
    }
  }

  return result
}

let generated = null
const moduleName = 'i18n.translations'

const i18nBundler = (options) => {
  return {
    name: 'locales-bundler',
    resolveId (importee) {
      if (importee === moduleName) {
        return importee
      }
      return null
    },
    load (id) {
      if (id === moduleName) {
        console.log(
          colors.underline.cyan('\ni18n bundler'), colors.grey(`: Target: ${options.target}, Base language: ${options.baseLanguage}`)
        )
        if (!generated) {
          generated = i18n(options)
          generated = 'export default ' + JSON.stringify(generated)
        }
        console.log(
          colors.bold('\nImport translations using: ') + colors.bold.green(`import translations from '${moduleName}'`)
        )
        return generated
      }
      return null
    },
    watchChange () {
      generated = null
    }
  }
}

export default i18nBundler
