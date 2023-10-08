require('dotenv').config()

const { io, logger } = require('../app')
const Util = require('./utils/Util')
const { WebcastPushConnection } = require('tiktok-live-connector')

const Ball = require('./game-objs/Ball')
const Wall = require('./game-objs/Wall')

//Game State
let GAME_START = false

//Env
const LIVE_NAME = process.env.LIVE_NAME
const WALL_BACKGROUND = process.env.WALL_BACKGROUND
const WALL_SIZE = parseInt(process.env.WALL_SIZE)
const WALL_ROW = parseInt(process.env.WALL_ROW)
const WALL_COL = parseInt(process.env.WALL_COL)
const BALL_SIZE = parseInt(process.env.BALL_SIZE)
const BALL_SPEED = parseInt(process.env.BALL_SPEED)
const BALL_MAX_SPEED = parseInt(process.env.BALL_MAX_SPEED)
const BALL_MAX_SIZE = parseInt(process.env.BALL_MAX_SIZE)
const BALL_MIN_SIZE = parseInt(process.env.BALL_MIN_SIZE)
const LIVE_MIN_LIKE = parseInt(process.env.LIVE_MIN_LIKE)
const WALL_BLOCKS_MIN = 4

//Build Wall
const wall = new Wall(WALL_SIZE, 2, WALL_COL, WALL_ROW, WALL_BACKGROUND)
let balls = []

//Respawn Blocks
setInterval(() => {
    if (balls.length === 0) spawnSimpleBall()

    balls = balls.filter((b) => b.status === true)
    const min = WALL_BLOCKS_MIN

    let arr = []
    wall.getBlocks((block) => {
        if (!block.status) arr.push(block)

    }, () => {
        if (arr.length === 0 || arr.length <= min) return

        let count = 0
        while (count < arr.length) {
            const obj = arr[Math.floor(Math.random() * arr.length)]

            if (obj) {
                wall.getBlocks((block) => {
                    if (block.id === obj.id) {
                        block.reset()
                        return true
                    }
                })
            }

            count++
        }

        emitStateStartGlobal(2, wall)
    })
}, 3000)

//Enable Server Socket
io.on('connection', (socket) => {
    //if (!GAME_START) return socket.disconnect()

    const clientAddress = socket.handshake.address;
    const clientID = socket.id;

    logger.info(`Client connected - ID: ${clientID}, Address: ${clientAddress}`)

    //Latency
    socket.on('ping', () => {
        socket.emit('pong')
    })

    emitStartState(socket, 2, wall)
    emitStartState(socket, 1, balls)

    socket.on('update-state', obj => {
        switch (obj.type) {
            case 1:
                if (obj.id) {
                    wall.getBlocks((block) => {
                        if (obj.id === block.id) {
                            block.break()

                            if (obj.ballId) {
                                balls.forEach(ball => {
                                    if (ball.id === obj.ballId && ball.size <= ball.maxSize) {
                                        ball.addSize(-Math.abs(ball.size * 0.05))
                                        ball.addSpeed(1)
                                        ball.msgLife = 0

                                        emitUpdateState(socket, 1, ball)
                                        return true
                                    }
                                })
                            }

                            emitUpdateState(socket, 2, block)
                            return true
                        }
                    })
                }
                break

            case 2:
                if (obj.data && obj.data.id) {
                    balls.forEach(ball => {
                        if (ball.id === obj.data.id) {
                            //ball.size = obj.data.size
                            ball.status = obj.data.status
                            ball.level = obj.data.level
                            ball.msgLife = obj.data.msgLife
                            ball.invincibleTime = 0
                            return true
                        }
                    })
                }
                break
        }
    })
})

//Connect to live
const tkCon = new WebcastPushConnection(LIVE_NAME, {
    enableExtendedGiftInfo : true
})

tkCon.connect().then(state => {
    logger.info('Live successful connected! @'+LIVE_NAME)
    GAME_START = true

    //Live Listeners
    tkCon.on('chat', p => {
        setBlockImagePixel(p.userId, p.profilePictureUrl, p.comment)
        logger.info(`[Live-Chat @${p.nickname}] ${p.comment}`)
    })

    tkCon.on('gift', msg => {
        const arr = balls.filter(i => i.userId === msg.userId)
        if (arr.length === 0) spawnRandomBall(msg.userId, msg.profilePictureUrl)
        else {
            let f = arr.find(ball => ball.size < ball.maxSize)
            if (!f) spawnRandomBall(msg.userId, msg.profilePictureUrl)

            arr.forEach(ball => {
                if (ball.size <= ball.maxSize) {                    
                    let size = msg.diamondCount
                    if (!size || size < 5) size = 5
                    ball.addSize(size)

                    ball.msg = msg.repeatCount + ' x Combo'
                    ball.msgLife = 80
                    ball.invincibleTime = 40
                    emitStateGlobal(1, ball)
                }
            })
        }
        logger.info(`[Live-Gift ${msg.nickname}] Show de Bola!! Uma lenda contribuiu para Live! ID: ${msg.giftId} Custo: ${msg.diamondCount} Repeat: ${msg.repeatCount}`)
    });

    tkCon.on('like', msg => {
        balls.forEach((ball) => {
            if (ball.userId === msg.userId) {
                if (msg.likeCount % LIVE_MIN_LIKE === 0) {
                    ball.addSize(5)
                    ball.msg(msg.repeatCount + ' x Like')
                    ball.msgLife = 80
                    ball.invincibleTime = 20
                    emitStateGlobal(1, ball)
                }
                return true
            }
        })

        if (msg.repeatCount > LIVE_MIN_LIKE) {
            const arr = balls.filter((i) => i.userId === msg.userId)
            if (arr.length === 0) spawnRandomBall(msg.userId, msg.profilePictureUrl)
        }

        logger.info(`[Live-Like ${msg.nickname}] Curtiu a live x${msg.likeCount}`)
    });

    //con.on('social', msg => socket.emit('social', msg));
    //con.on('like', msg => socket.emit('like', msg));
    //con.on('questionNew', msg => socket.emit('questionNew', msg));
    //con.on('linkMicBattle', msg => socket.emit('linkMicBattle', msg));
    //con.on('linkMicArmies', msg => socket.emit('linkMicArmies', msg));
    //con.on('liveIntro', msg => socket.emit('liveIntro', msg));
    //con.on('emote', msg => socket.emit('emote', msg));
    //con.on('envelope', msg => socket.emit('envelope', msg));
    //con.on('subscribe', msg => socket.emit('subscribe', msg));


}).catch(err => {
    logger.error('Erro to connected in live @'+LIVE_NAME, err.toString())
    Object.keys(io.sockets.sockets).forEach(function(s) {
        io.sockets.sockets[s].disconnect(true);
    })
}) 

// Game

function spawnRandomBall(userId, imgUrl) {    
    const ball = new Ball(BALL_SIZE, BALL_MAX_SIZE, BALL_MIN_SIZE, BALL_SPEED, BALL_MAX_SPEED,  Util.getRandomRGB())
    ball.registerUser(userId, imgUrl)
    balls.push(ball)

    emitStateGlobal(1, ball)
}

function spawnSimpleBall() {    
    const ball = new Ball(BALL_SIZE, BALL_MAX_SIZE, BALL_MIN_SIZE, BALL_SPEED, BALL_MAX_SPEED, Util.getRandomRGB())
    balls.push(ball)

    emitStateGlobal(1, ball)
}

function setBlockImagePixel(userId, imgUrl, comment) {
    wall.getBlocks((block) => {
        if (block.status && block.isNotUser()) {
            block.registerUser(userId, imgUrl)
            block.setMsg(comment)
            emitStateGlobal(2, block)
            return true
        }
    })
}

//Emitter
function emitStateStartGlobal(type, data) {
    io.sockets.emit('game-state-start', { type : type, data : data })
}

function emitStateGlobal(type, data) {
    io.sockets.emit('game-state-update', { type : type, data : data })
}

function emitStartState(socket, type, data) {
    socket.emit('game-state-start', { type : type, data : data })
}

function emitUpdateState(socket, type, data) {
    socket.emit('game-state-update', { type : type, data : data })
}