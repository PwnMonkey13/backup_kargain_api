require('dotenv').config()

const env = process.env.NODE_ENV || 'production'
const isProd = env === 'production'
const api = isProd ? 'https://kargain-api.now.sh/api' : 'http://localhost:8080/api'
const frontend = isProd ? 'https://kargain.com' : 'http://localhost:3000'
const providers = ['google', 'facebook']
const callbacks = providers.map(provider => `${api}/auth/${provider}/callback`)
const [googleURL, facebookURL] = callbacks

const db = isProd ? {
    mongo_location: process.env.MONGODB_URI_PROD,
} : {
    mongo_location: process.env.MONGODB_URI_DEV || 'mongodb://localhost:27017/kargain'
}

module.exports = {
    isProd,
    env,
    frontend,
    db,
    api_path: '/v1',
    whileListDomains: [
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:5000',
        'https://kargain.com',
        'https://kargain.web.app',
        'https://kargain-api.now.sh'
    ],
    externalsAPI: {
        vicopo: {
            API_URL: 'https://vicopo.selfbuild.fr/cherche'
        },
        geoGouv: {
            adresse_API_URL: 'https://api-adresse.data.gouv.fr/search',
            geo_API_URL: 'https://api-adresse.data.gouv.fr/search'
        },
        vindecoderFree: {
            API_URL: 'https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues'
        },
        vindecoder: {
            API_URL: 'http://api.carmd.com/v3.0',
            'partner-token': '74563ccc0b0c4ca98e7cd7292b513716',
            authorization: 'Basic MWM2MWE4NGMtMGQzZC00MDA2LTkxMGItMmZlNDUyN2QxMTc1'
        },
        databasesCar: {
            API_URL: 'https://databases.one/api',
            API_TOKEN: '2bc401d0b2c3f47eb29ca4946'
        }
    },
    stripe: {
        test: {
            public_key: 'pk_test_51GqJrJEItcAGSRw8the6YZdACyYMrHOZsCRKSfNr6tJRlN4L3MpXpUjo7MOpAPvPcpY5WvIxDSwsZRH5JTKU5q9a00dDJhABpd',
            secret_key: 'sk_test_51GqJrJEItcAGSRw8je9w61pcgtwbK7Gu7UTKKXIr5V9jH4ETEXwdg6KWTLJse2ARytn3IzAFc599Pr8HCCBgBtps00P78vBBV1'
        },
        recovery: 'fxrb-jfcm-bjgz-mogf-zvtc'
    },
    messenger: {
        token: 'EAAJHGZAf9eZAEBACXZCVAQE621nb7GOs2hFFQu9jHEVWvNue91IiYySbj6ExZC3JxBBdeUvtH5ohJNrxZAjtvZCB9NodTZAA10cueHZBiPEoYtyJVfvophzJsnU4rKZB3bTGxqZBBzA7GvWLCuzoSZBjH2ds8B8JlmEfQE3BkQAOMF7TLOJGxs1GVX6hm3FMZCWtqEQZD'
    },
    sso: {
        facebook: {
            clientID: '3103914796332638',
            clientSecret: 'f24da17a2d60ed378fcdd4975742bec7',
            profileFields: 'email,id,last_name,first_name,name,picture',
            callbackURL: facebookURL
        },
        google: {
            clientID: '',
            clientSecret: '',
            callbackURL: googleURL
        }
    },
    aws: {
        s3: {
            S3_KEY: 'AKIAXWHL2GWRJIYFQGFD',
            S3_SECRET: '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',
            BUCKET_NAME: 'kargain',
            BUCKET_REGION: 'eu-west-3'
        }
    },
    mailer: {
        contactForm: 'contactform@kargain.com',
        from: {
            name: 'Contact Kargain',
            // email : 'contact@kargain.com'
            email: 'giraudo.nicolas13@gmail.com'
        },
        mailjet: {
            API_KEY: '1228806536f8584e9449c86d3675d821',
            password: '471a6894957996fff615aea4634a5f89'
        },
        stmp: {
            ethereal: {
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'josiane8@ethereal.email',
                    pass: 'zndYbvvQ4faW8w1WQd'
                }
            },
            mailjet: {
                host: 'in-v3.mailjet.com',
                port: 587,
                auth: {
                    user: '1228806536f8584e9449c86d3675d821',
                    pass: '471a6894957996fff615aea4634a5f89'
                }
            },
            gmail: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'giraudo.nicolas',
                    pass: 'tX29P4QNadD7kAG7x5'
                }
            }
        }
    },
    mailChimp: {
        API_KEY: '991e70c5ec85e1e1432e3486242cdc5d-us19'
    },
    redis: {
        host: 'redis-10042.c55.eu-central-1-1.ec2.cloud.redislabs.com',
        port: 10042,
        password: 'rKkUtAfAdwdYeQPnSr9BWrhiHa7KzqOw'
    },
    port: parseInt(process.env.PORT) || 8080,
    jwt: {
        encryption: process.env.JWT_ENCRYPTION || 'MyS3cr3tK3Y',
        expiration: process.env.JWT_EXPIRATION || 60 * 60 * 24 * 30
    }
}
