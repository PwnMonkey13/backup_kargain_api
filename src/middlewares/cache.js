const redis = require('redis');
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

function cache(name){
  return (req, res, next) => {
    client.get(name, (err, data) => {
      if (err) throw err;
      if (data !== null) {
        // res.send(setResponse(username, data));
      } else {
        next();
      }
    });
  }
}



module.exports = cache;
