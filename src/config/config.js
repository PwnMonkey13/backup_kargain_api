require('dotenv').config() // instatiate environment variables

let env;
let config;
const global = {
  port: parseInt(process.env.PORT) || 8080,
  env: process.env.NODE_ENV || "development",
  jwt: {
    encryption: process.env.JWT_ENCRYPTION || 'changeme',
    expiration: process.env.JWT_EXPIRATION || '10000'
  },
}

const dev = {
  db: {
    // mongo_location: 'mongodb://' + CONFIG.db.host + ':' + CONFIG.db.port + '/' + CONFIG.db.name;
    mongo_location: process.env.MONGODB_URI_DEV,
    name: process.env.DB_NAME_DEV || 'kargain'
  }
}

const prod = {
  db: {
    mongo_location: process.env.MONGODB_URI_PROD,
    name: process.env.DB_NAME_PROD || 'test'
  }
}

switch (global.env) {
  case 'development' || 'dev':
  default :
    env = 'dev';
    config = dev;
    break
  case 'production' || 'prod':
    env = 'prod';
    config = prod;
    break
}

module.exports = { ...global, ...config, env, isDev : env === 'dev'};
