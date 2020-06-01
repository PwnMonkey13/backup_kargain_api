const mongoose = require('mongoose')
const app = require('./src/app')
const config = require('./src/config/config')

mongoose.Promise = global.Promise // set mongo up to use promises

mongoose.set('debug', true);

mongoose.connect(config.db.mongo_location, { useCreateIndex: true, useNewUrlParser: true })
.catch(err => {
    console.log(err)
    throw new Error('*** Can Not Connect to Mongo Server:' + config.db.mongo_location)
})

const db = mongoose.connection

db.once('open', () => {
    console.log('Connected to mongo at ' + config.db.mongo_location)
    const server = app.listen(config.port, 'localhost', function () {
        const host = server.address().address
        const port = server.address().port
        console.log('There will be dragons http://' + host + ':' + port)
    })
})

db.on('error', console.error.bind(console, 'connection error:'))

db.on('close', function () {
    console.log('Mongoose default connection disconnected through app termination')
})

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    mongoose.connection.close(function () {
        console.log('Mongoose default connection disconnected through app termination')
        return process.exit(0)
    })
})
