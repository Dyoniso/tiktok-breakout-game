require('dotenv').config()

const express = require('express')
const { createServer } = require('http');
const Logger = require('./api/utils/Looger')
const logger = new Logger('app')

const HOST = process.env.HOST
const PORT = process.env.PORT

const app = express()
const httpServer = createServer(app)

// Serve frontend files
app.use(express.static('public'));

const io = require('socket.io')(httpServer, {
    cors: {
        origin: '*'
    },
    pingInterval: 1000,
    pingTimeout: 30000,
})

httpServer.listen(PORT, HOST, () => {
    logger.info(`Http Server Started! Pong.js ${HOST}:${PORT}`)
})

module.exports = {
    io : io,
    logger : logger
}

require('./api/game')