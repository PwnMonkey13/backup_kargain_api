require('dotenv').config()

let env;
let config;
const global = {
  CORS_WHITELIST : ['http://localhost:3000', 'https://kargain-app.now.sh'],
  externalsAPI : {
    car : {
      API_URL : "https://databases.one/api",
      API_TOKEN : '2bc401d0b2c3f47eb29ca4946',
    }
  },

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
    name: process.env.DB_NAME_PROD || 'kargain'
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
