const Logger = require('logdna')
const config = require('../config/config')
const options = {
    app : 'Kargain API',
    env: 'Development'
}

const logger = Logger.createLogger(config.logDNA.apiKey, options)

// logger.log('My Sample Log Line');
// logger.info('My Sample Log Line');
// logger.warn('My Sample Log Line');
// logger.debug('My Sample Log Line');
// logger.error('My Sample Log Line');
// logger.fatal('My Sample Log Line');
// logger.trace('My Sample Log Line');
// logger.log('My Sample Log Line', {
//     level: 'warn',
//     meta: {
//         foo: 'bar',
//         nested: {
//             nest1: 'nested text'
//         }
//     }
// });

module.exports = logger
