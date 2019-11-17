import dataset from './dataset/index.js'
import MessageFormat from 'messageformat'

function getMessage (key, params = {}) {
  let lang = getLocale()['language']
  let msg = key
  if ((lang in dataset) && (key in dataset[lang].strings)) {
    msg = dataset[lang]['strings'][key]
  } else if (key in dataset['en'].strings) {
    msg = dataset['en']['strings'][key]
  }
  return new MessageFormat(lang).compile(msg)(params)
}

function setLocale ({ language }) {
  if (language) {
    window.localStorage.setItem('language', language)
  }
}

function getLocale () {
  return {
    language: window.localStorage.getItem('language')
  }
}

function getSupportedLanguages () {
  return Object.keys(dataset).map((isoCode) => ({
    isoCode,
    'language': dataset[isoCode].language
  }))
}

export {getMessage, setLocale, getLocale, getSupportedLanguages}
