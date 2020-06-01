const fetch = require('node-fetch')
const querystring = require('querystring')

function stringToSlug (str) {
    str = str.replace(/^\s+|\s+$/g, '') // trim
    str = str.toLowerCase()
    
    // remove accents, swap ñ for n, etc
    const from = 'àáãäâèéëêìíïîòóöôùúüûñç·/_,:;'
    const to = 'aaaaaeeeeiiiioooouuuunc------'
    
    for (let i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }
    
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-') // collapse dashes
    
    return str
}

function convertToDotNotation (obj, newObj = {}, prefix = '') {
    for (const key in obj) {
        if (typeof obj[key] === 'object') {
            convertToDotNotation(obj[key], newObj, prefix + key + '.')
        } else {
            newObj[prefix + key] = obj[key]
        }
    }
    return newObj
}

const resolveObjectKey = (obj, str) => {
    if (!str) return obj
    if (typeof obj === 'object') {
        str = str.replace(/\[(\w+)\]/g, '.$1') // convert indexes to properties
        str = str.replace(/^\./, '')           // strip a leading dot
        const a = str.split('.')
        for (let i = 0, n = a.length; i < n; ++i) {
            const k = a[i]
            if (!obj) return
            if (k in obj) {
                obj = obj[k]
            } else {
                return
            }
        }
    }
    return obj
}

const fetchExternalApi = (url, headers = {}) => {
    return fetch(url, { headers })
    .then(response => response.json())
    .catch(err => {
            throw err
        }
    )
}

const capitalizeWords = (str) => {
    if(!str) return
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

const buildUrl = (baseUrl, params) => {
    return Object.keys(params).length ? `${baseUrl}?${querystring.stringify(params)}` : baseUrl
}

module.exports = {
    stringToSlug,
    convertToDotNotation,
    resolveObjectKey,
    fetchExternalApi,
    buildUrl,
    capitalizeWords
}
