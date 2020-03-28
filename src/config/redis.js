const redis = require('redis');
const { promisify } = require("util");
const CONFIG = require('../config/config');

const redisClient = redis.createClient({
  port: CONFIG.redis.port,
  host: CONFIG.redis.host,
  password : CONFIG.redis.password
});

redisClient.on("error", function(err) {
  throw err;
});

const getCacheKey = (key) => {
  return new Promise((resolve, reject) => {
    try {
      redisClient.get(key, (err, entry) => {
        if (err) throw err
        if (entry) {
          try {
            resolve(JSON.parse(entry));
          } catch (e) {
            throw e
          }
        } else resolve(null);
      })
    } catch (err) {
      throw err
    }
  });
};

const delCacheKey = (key, cb) => {
  redisClient.del(key, (err, data) => cb(err, data))
}

/*
 * Calling unref() will allow this program to exit immediately after the get
 * command finishes. Otherwise the client would hang as long as the
 * client-server connection is alive.
 */
redisClient.unref();

module.exports = {redisClient, getCacheKey, delCacheKey};
