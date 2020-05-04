const fetch = require('node-fetch')
const utils = require('../../utils/functions')
const redisConfig = require('../../config/redis')
const redisClient = redisConfig.redisClient
const CONFIG = require('../../config/config')
const BASE_API_URL = CONFIG.externalsAPI.databasesCar.API_URL
const BASE_API_KEY = CONFIG.externalsAPI.databasesCar.API_TOKEN

const delCacheKey = (req, res, next) => {
  const key = req.params.key
  redisConfig.delCacheKey(key, function (err, data) {
    if (err) return next(err)
    return res.json({ err, msg: key, data })
  })
}

const getData = (req, res, next) => {
  const params = {
    ...req.query,
    api_key: BASE_API_KEY,
    format: 'json'
  }

  const url = utils.buildUrl(BASE_API_URL, params)

  redisConfig.getCacheKey(url).then(data => {
    if (data) return res.json({ success: true, msg: 'from redis', hostname: redisClient.address, data })
    else {
      fetchApi(url).then(data => {
        redisClient.set(url, JSON.stringify(data))
        return res.json({ success: true, msg: 'from API', url, data })
      }).catch(next)
    }
  })
}

const fetchApi = (url, headers = {}) => {
  return fetch(url, { headers })
    .then(response => {
      if (response.status >= 400) {
        throw new Error('Bad response from server')
      }
      return response.json()
    })
    .then(data => {
      if (data.errors) throw data.error
      else return data.result
    })
    .catch(err => { throw err }
    )
}

module.exports = { getData, delCacheKey }
