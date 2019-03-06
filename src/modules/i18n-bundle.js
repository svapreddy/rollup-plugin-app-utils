import spelunk from 'spelunk'
import log from 'log-utils'
import colors from 'ansi-colors'
import path from 'path'
import fsextra from 'fs-extra'

const generateTranslations = (options) => {
  const target = options.target
  const baseLanguage = options.baseLanguage
  let transformer = options.transformer

  let i18nData = spelunk.sync(target, {
    keepExtensions: false,
    exclude: path.join(target, '/') + '**/*.!(json)'
  })

  let patches = {}

  let basei18n = i18nData[baseLanguage]
  let langi18n, lang, basei18nComponenti18n, langi18nComponenti18n, key, clonedBasei18nComponenti18n, component
  for (lang in i18nData) {
    if (lang === baseLanguage) continue
    langi18n = i18nData[lang]
    patches[lang] = {}
    for (component in basei18n) {
      basei18nComponenti18n = basei18n[component]
      langi18nComponenti18n = langi18n[component]
      if (langi18nComponenti18n) {
        let t = JSON.stringify(basei18nComponenti18n)
        clonedBasei18nComponenti18n = JSON.parse(t)
        if (JSON.stringify(langi18nComponenti18n) !== t) {
          for (key in clonedBasei18nComponenti18n) {
            clonedBasei18nComponenti18n[key] = langi18nComponenti18n[key] || clonedBasei18nComponenti18n[key]
          }
          patches[lang][component] = clonedBasei18nComponenti18n
          i18nData[lang][component] = clonedBasei18nComponenti18n
        }
      } else if (!langi18nComponenti18n) {
        i18nData[lang][component] = basei18nComponenti18n || {}
        patches[lang][component] = basei18nComponenti18n || {}
      }
    }

    for (component in langi18n) {
      if (!basei18n[component]) {
        patches[lang][component] = null
      }
    }
  }

  console.log(colors.grey(`  ${log.info} Languages:`), colors.green(`${Object.keys(i18nData).join(', ')}`))

  for (lang in patches) {
    let components = Object.keys(patches[lang])
    components.forEach((component) => {
      let content = patches[lang][component]
      let filepath = path.join(target, lang, component + '.json')
      if (!content) {
        console.log(colors.magenta(`  ${log.info} Removing ${lang}/${component}. Matching base language: ${baseLanguage}`))
        fsextra.removeSync(filepath)
      } else {
        console.log(colors.grey(`  ${log.info} Matching ${lang}/${component} with ${baseLanguage}/${component} keys`))
        fsextra.writeJSONSync(filepath, content, {
          spaces: '\t'
        })
      }
    })
  }

  transformer = transformer || ((lang, data) => {
    return {
      translations: i18nData[lang]
    }
  })

  for (lang in i18nData) {
    i18nData[lang] = transformer(lang, i18nData[lang])
  }

  return i18nData
}

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
          generated = generateTranslations(options)
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
