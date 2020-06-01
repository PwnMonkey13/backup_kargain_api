const fetch = require('node-fetch')
const utils = require('../../utils/functions')
const redisConfig = require('../../config/redis')
const redisClient = redisConfig.redisClient
const CONFIG = require('../../config/config')
const BASE_API_URL = CONFIG.externalsAPI.databasesCar.API_URL
const BASE_API_KEY = CONFIG.externalsAPI.databasesCar.API_TOKEN
const Errors = require('../../utils/Errors')

const delCacheKey = (req, res, next) => {
    const key = req.params.key
    redisConfig.delCacheKey(key, function (err, data) {
        if (err) return next(err)
        return res.json({ err, msg: key, data })
    })
}

const getDataAction = (req, res, next) => {
    const params = {
        ...req.query,
        api_key: BASE_API_KEY,
        format: 'json'
    }
    
    const url = utils.buildUrl(BASE_API_URL, params)
    
    redisConfig.getCacheKey(url).then(data => {
        console.log("data")
        console.log(data)
        if (data) return res.json({
            success: true,
            msg: 'from redis',
            hostname: redisClient.address,
            data
        })
        else {
            fetchApi(url).then(data => {
                console.log(data)
                redisClient.set(url, JSON.stringify(data))
                console.log('redis new entry')
                return res.json({ success: true, msg: 'from API', url, data })
            }).catch(err => {
                console.log(err)
                return next(err)
            })
        }
    })
}

const databaseOneAPIErrorsMapper = (code) => {
    switch (Number(code)){
        case 111 :
            return "Invalid Api Key"
        case 222:
            return "Expired Api Key"
        case 333:
            return "Invalid Language Variable"
        case 444:
            return "Invalid Select Variable"
        case 555:
            return "No Access"
        case 666:
            return "Missing Variables"
        default:
            return "Error"
    }
}

const fetchApi = (url, headers = {}) => {
    return fetch(url, { headers })
    .then(response => {
        if (response.status >= 400) {
            throw Errors.Error('Bad response from server', 'ExternalCarApiError', response.status)
        }
        return response.json()
    })
    .then(data => {
        console.log(data)
        if (data.errors > 0){
            const error = data.error[0];
            const msg = databaseOneAPIErrorsMapper(error.code)
            throw Errors.Error(msg, "ExternalCarApiError", error.code)
        }
        else return data.result
    })
    .catch(err => { throw err })
}

module.exports = { getDataAction, delCacheKey }
