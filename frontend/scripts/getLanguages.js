const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const readline = require('readline')
let prompts = readline.createInterface(process.stdin, process.stdout)

const API_URL = 'https://internal.zopsmart.com/translations/api.php'

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'  // THIS MAKES EVERYTHING UNSECURE

const style = {
  bold: text => `\x1b[1m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  cyan: text => `\x1b[36m${text}\x1b[0m`
}

function mkdirp (targetDir) {
  const sep = path.sep
  const initDir = path.isAbsolute(targetDir) ? sep : ''
  targetDir.split(sep).reduce((parentDir, childDir) => {
    const curDir = path.resolve(parentDir, childDir)
    try {
      fs.mkdirSync(curDir)
    } catch (err) {
      if (err.code !== 'EEXIST') {
        throw err
      }
      // console.log(`Directory ${curDir} already exists!`)
    }
    return curDir
  }, initDir)
}

function saveJSONasModule ({ filepath, filename, json }) {
  return new Promise((resolve, reject) => {
    let content = JSON.stringify(json, 2, 2)
    // This line is to save the JSON file as an ES6 module instead
    content = 'const data = ' + content + '\n\nexport default data\n'
    mkdirp(filepath)
    fs.writeFile(path.join(filepath, filename + '.js'), content, 'utf8', resolve)
  })
}

function saveLanguagesIndex ({ filepath, filename, languages }) {
  let content = ''
  languages = Object.keys(languages).map(lang => ({
    name: lang,
    isoCode: languages[lang].isoCode,
    display: languages[lang].name
  }))
  languages.forEach(lang => {
    content += `import ${lang.name} from './${lang.name}'\n`
  })
  content += '\n'
  content += 'const data = {\n'
  content += languages.map(lang => (
    `  '${lang.isoCode}': { 'language': '${lang.display}', 'strings': ${lang.name} }`
    )).join(',\n')
  content += '\n}'
  content += '\n\nexport default data\n'
  return new Promise((resolve, reject) => {
    mkdirp(filepath)
    fs.writeFile(path.join(filepath, filename + '.js'), content, 'utf8', resolve)
  })
}

function prompt (query, hidden = false, callback) {
  if (hidden) {
    let stdin = process.openStdin()
    let i = 0
    process.stdin.on('data', function (char) {
      char = char + ''
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause()
          break
        default:
          process.stdout.write('\x1b[2K\x1b[200D' + query)
          i++
          break
      }
    })
    prompts.question(query, function (value) {
      prompts.history = prompts.history.slice(1)
      callback(value)
    })
  } else {
    prompts.question(query, callback)
  }
}

function parseResponse (response) {
  return new Promise((resolve, reject) => {
    if (response.ok) {
      resolve(response.json())
    } else {
      reject(new Error('API error'))
    }
  })
}

function fetchDatasets (username, password) {
  let successes = []
  let total
  if (!username || !password) {
    saveLanguagesIndex({
      filepath: path.join('src', 'lib', 'translator', 'dataset', 'downloaded'),
      filename: 'index',
      languages: {}
    }).then(() => {
      console.error(style.red('Skipped loading languages [credentials missing]'))
      process.exit()
    })
  }
  // Fetch the languages index first
  fetch(`${API_URL}?api=getLanguages`, {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
    }
  })
  .then(parseResponse)
  .then(
    response => {
      let languages = Object.keys(response)
      console.log(`${languages.length} languages available. Proceeding to download.`)
      let counter = languages.length
      total = languages.length
      return Promise.all(languages.map(language => {
        return fetch(`${API_URL}?api=getTranslations&lang=${language}`, {
          method: 'GET',
          headers: {
            Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
          }
        })
        .then(parseResponse)
        .then(
          response => {
            return saveJSONasModule({
              filepath: path.join('src', 'lib', 'translator', 'dataset', 'downloaded', language),
              filename: 'index',
              json: response
            })
            .then(() => {
              successes.push(language)
              console.log(style.green(`${language} \u2714`))
            })
          },
          err => {
            console.error(style.red(`${language} \u2718\n[${err.message}]`))
          }
        )
        .then(() => {
          counter--
          if (counter === 0) {
            saveLanguagesIndex({
              filepath: path.join('src', 'lib', 'translator', 'dataset', 'downloaded'),
              filename: 'index',
              languages: Object.assign({}, ...successes.map(lang => ({
                [lang]: response[lang]
              })))
            }).then(() => {
              console.log(style.cyan(`Done. ${successes.length}/${total} languages downloaded.`))
              process.exit()
            })
          }
        })
      }))
    },
    (err) => {
      console.error(style.red('Unable to authenticate'), `[${err.message}]`)
      process.exit(1)
    }
  )
  .catch(
    err => {
      console.error(style.red('Script aborted'))
      process.exit(1)
    }
  )
}

// Script begins here
if (process.argv.length >= 4) {
  // Support command line arguments for credentials
  let username = process.argv[2]
  let password = process.argv[3]
  fetchDatasets(username, password)
} else {
  console.log(style.bold('To load languages, enter valid credentials. Press [Enter] twice to skip this step.'))
  prompt('Username: ', false, function (username) {
    prompt(`Password for user ‘${username}’: `, true, function (password) {
      fetchDatasets(username, password)
    })
  })
}
