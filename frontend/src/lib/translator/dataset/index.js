import defaultStrings from './default'
import downloadedLanguages from './downloaded'

const defaultLangs = {
  'en': {
    'language': 'English',
    'strings': defaultStrings
  }
}

// Preserve default strings in case external dataset doesn't contain them
const data = Object.assign({}, defaultLangs, ...Object.keys(downloadedLanguages).map(isoCode => {
  let downloadedLanguage = downloadedLanguages[isoCode]
  let strings = downloadedLanguage.strings
  if (isoCode in defaultLangs) {
    strings = Object.assign({}, defaultLangs[isoCode]['strings'], downloadedLanguage.strings)
  }
  return {
    [isoCode]: Object.assign({}, downloadedLanguages[isoCode], { strings })
  }
}))

export default data
