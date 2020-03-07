const fetch = require('node-fetch');
const redis = require('redis');
const flatten = require('flat');
const cacheMiddleware = require('http-cache-middleware')()
const responseTime = require('response-time');
const querystring = require('querystring');
const CONFIG = require('../../config/config');
const BASE_API_URL = CONFIG.externalsAPI.car.API_URL;
const BASE_API_KEY = CONFIG.externalsAPI.car.API_TOKEN;

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

client.on("error", function(err) {
  console.log(err);
});

/*
 * Calling unref() will allow this program to exit immediately after the get
 * command finishes. Otherwise the client would hang as long as the
 * client-server connection is alive.
 */
client.unref();


const test  = (req, res, next) => {
  del('cars', function(err, data){
    if(err) console.log(err);
    console.log(data);
    return res.json({ err, data });
  });

  // const o = {
  //     name : "Kyle Davis",
  //     address : "123 Main Street"
  // };

  // client.get('test', (err, data) => {
  //   console.log(data);
  //   if(err) console.log(err);
  //   else if(data){
  //     return res.json({ success: true, data : JSON.parse(data) });
  //   }
  //   else{
  //     client.set("test", JSON.stringify(o));
  //     console.log("redis write");
  //     return res.json({ msg: "write" });
  //   }
  // });
};

const del = (key, cb) => {
  client.del(key, (err, data) => cb(err, data))
};

const getData = (req, res, next) => {
  const params = {
    ...req.query,
    api_key : BASE_API_KEY,
    format : 'json'
  };
  const url = buildUrl(BASE_API_URL, params);

  try {
    client.get('cars', (err, entry) => {
      if(err) return next(err);
      if (entry) {
        try{
          const data = JSON.parse(entry);
          return res.json({ success: true, msg : 'from redis', data });
        }catch (e) {
          return next(e)
        }
      } else {
        fetchApi(url).then(data => {
          client.set('cars', JSON.stringify(data));
          return res.json({ success: true, msg : "from API", data});
        }).catch(next)
      }
    });
  } catch(err) {
    next(err);
  }
}

const fetchApi = (url) => {
  return fetch(url).then(function(response) {
      if (response.status >= 400) {
        throw "Bad response from server";
      }
      return response.json();
    }).then(function(data) {
      if (data.errors) throw data.error;
      else return data.result;
    }).catch(err => {
        throw err;
      }
    )
};

const buildUrl = (baseUrl, params) => {
  return `${baseUrl}?${querystring.stringify(params)}`;
}

module.exports = { getData, test }
