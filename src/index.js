const mongoose = require('mongoose')
const app = require('./app')
const config = require('./config/config')
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const db = mongoose.connection
mongoose.Promise = global.Promise // set mongo up to use promises
mongoose.set('debug', true);

const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
};

let interval;

io.on('connection', (client) => {
    console.log('Client connected...');
    if (interval) {
        clearInterval(interval);
    }
    
    interval = setInterval(() => getApiAndEmit(client), 1000);
    client.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
    
    client.on('join', function(data) {
        console.log(data);
    });
    
    // // Get the last 10 messages from the database.
    // Message.find().sort({createdAt: -1}).limit(10).exec((err, messages) => {
    //     if (err) return console.error(err);
    //
    //     // Send the last messages to the user.
    //     socket.emit('init', messages);
    // });
    //
    // // Listen to connected users for a new message.
    // socket.on('message', (msg) => {
    //     // Create a message with the content and the name of the user.
    //     const message = new Message({
    //         content: msg.content,
    //         name: msg.name,
    //     });
    //
    //     // Save the message to the database.
    //     message.save((err) => {
    //         if (err) return console.error(err);
    //     });
    //
    //     // Notify all other users about a new message.
    //     socket.broadcast.emit('push', msg);
    // });
});

mongoose.connect(config.db.mongo_location, { useCreateIndex: true, useNewUrlParser: true })
.catch(err => {
    console.log(err)
    throw new Error('*** Can Not Connect to Mongo Server:' + config.db.mongo_location)
})

db.once('open', () => {
    console.log('Connected to mongo at ' + config.db.mongo_location)
    server.listen(config.port, 'localhost', function (a) {
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
