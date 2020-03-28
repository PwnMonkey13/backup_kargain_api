const fetch = require('node-fetch')
const querystring = require('querystring')

function stringToSlug (str) {
  str = str.replace(/^\s+|\s+$/g, '') // trim
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  let from = 'àáãäâèéëêìíïîòóöôùúüûñç·/_,:;'
  let to = 'aaaaaeeeeiiiioooouuuunc------'

  for (let i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes

  return str
}

function convertToDotNotation (obj, newObj = {}, prefix = '') {
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      convertToDotNotation(obj[key], newObj, prefix + key + '.')
    } else {
      newObj[prefix + key] = obj[key]
    }
  }
  return newObj
}

const fetchExternalApi = (url, headers = {}) => {
  return fetch(url, { headers })
    .then(response => response.json())
    .catch(err => {
      throw err
      }
    )
}

const buildUrl = (baseUrl, params) => {
  return Object.keys(params).length ? `${baseUrl}?${querystring.stringify(params)}` : baseUrl;
}

module.exports = { stringToSlug, convertToDotNotation, fetchExternalApi, buildUrl }
