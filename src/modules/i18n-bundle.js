// import spelunk from 'spelunk'
import log from 'log-utils'
import colors from 'ansi-colors'
import path from 'path'
// import fsextra from 'fs-extra'
import fs from 'fs'
import { createPatch, applyPatch } from 'rfc6902'
import { set } from 'object-path'

const walk = ({ dir, filter, relativeTo, list = {}, depth = 0 }) => {
  const files = fs.readdirSync(dir)
  ++depth
  for (const file of files) {
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

  const { target, baseLanguage, transformer, generated } = options

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
    if (baseLanguage !== lang) {
      let patch = createPatch(langJson, base)
      patch = patch.filter((change) => {
        return change.op !== "replace"
      })
      patches[lang] = patch
      applyPatch(langJson, patch)
    }
    
    let translations = {}
    
    for (const file in langJson) {
      const parsed = path.parse(file)
      const key = path.join(parsed.dir, parsed.name).split(path.sep)
      set(translations, key, langJson[file])
    }

    result[lang] = transform(lang, translations)
  }

  const languages = colors.green(`${Object.keys(result).join(', ')}`)
  console.log(colors.grey(colors.underline(`Languages found:`)), languages)

  console.log(JSON.stringify(patches, null, '\t'))

  const methods = {
    add: 'green',
    remove: 'magenta'
  }

  for (const lang in patches) {
    console.log(colors.grey(colors.underline(`Ops for language: ${lang}`)))
    
    for (let i = 0; i < patches[lang].length; i++) {
      const patch = patches[lang][i]
      const message = ` op: ${patch.op} path: ${patch.path} value: ${patch.value || 'NA'}`
      console.log(colors[methods[patch.op]](message))
      
      let key = null

      let location = patch.path.substring(1).replace(/(~1)/g, '/')
      let split = location.split('.json')
      if (split[1]) {
        key = split[1].substring(1)
      }

      location = path.join(target, lang, `${split[0]}.json`)
      location = path.join(target, path.relative(target, location))

      if (patch.op === 'add') {
        let value = patch.value
        if (!fs.existsSync(location)) {
          fs.writeFileSync(location, value)
        } else if (key) {
          const content = JSON.parse(fs.readFileSync(location, 'utf-8'))
          set(content, key.split('/'), value)
        }
      } else if (patch.op === 'remove') {
        fs.unlinkSync(location)
      }
      
      console.log(location, key)

    }
  }

  update({ patches, target, generated })

  return result
}

// let changed = []
// patch = patch.filter((change) => {
//   const valid = change.op !== "replace"
//   if (valid) {
//     let location = change.path.substring(1).replace(/(~1)/g, '/')
//     let parsed = path.parse(location)
//     changed.push(parsed)
//   }
//   return valid
// })
// patches[lang] = {
//   patch,
//   changed
// }

// let location = change.path.substring(1).replace(/(~1)/g, '/')
//         let parsed = path.parse(location)
//         toBe.changed.push([parsed, change.op])

let generated = null
let moduleName = 'i18n.translations'

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
          colors.underline.cyan(`\ni18n bundler`), colors.grey(`: Target: ${options.target}, Base language: ${options.baseLanguage}`)
        )
        if (!generated) {
          generated = i18n(options)
          generated = 'export default ' + JSON.stringify(generated)
        }
        console.log(
          colors.grey(`  ${log.info} Import translations using: `) + colors.bold.green(`import translations from '${moduleName}'`)
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
