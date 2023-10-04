$(document).ready(() => {
    const backEndUrl = window.location.origin
    const canvas = $('#game')[0]
    const ctx = canvas.getContext('2d')

    //Responsive Canvas
    canvas.width = window.screen.width;
    canvas.height = window.screen.height;

    //Background Default Texture
    const backgroundData = GIF()
    backgroundData.load(window.location.origin + '/img/background.gif')

    //Connect Socket
    const socket = io(backEndUrl, { query : `width=${canvas.width}&height=${canvas.height}` })

    //Emit and List Animation
    let animId = null
    let latency = 0
    let timerLatency = null
    let startTime = null

    //Game Objects
    let balls = []
    let wall = null
    let particles = []

    class Particle {
        constructor(x, y, r, life) {
            this.startX = x
            this.startY = y
            this.r = 5 + Math.random() * r
            this.life = 30 + Math.random() * life
            this.remainingLife = this.life
            this.startTime = Date.now()
            this.animationDuration = 1000
            
            this.speed = {
                x: -5 + Math.random() * 10,
                y: -5 + Math.random() * 10
            }
        }

        setRgb(arr) {
            this.rgbArray = arr
        }

        draw = ctx => {            
            if (this.remainingLife > 0 && this.r > 0) {
                ctx.fillStyle = "rgba(" + this.rgbArray[0] + ',' + this.rgbArray[1] + ',' + this.rgbArray[2] + ", 1)"
                ctx.fillRect(this.startX, this.startY, this.r, this.r)

                this.remainingLife--
                this.r -= 0.25
                this.startX += this.speed.x
                this.startY += this.speed.y
            }
        }
    }

    socket.on('connect', () => {
        //Latency
        timerLatency = setInterval(function() {
            startTime = Date.now()
            socket.emit('ping')
        }, 5000)

        socket.on('pong', () => latency = Date.now() - startTime)

        //Game Socket Response
        socket.on('game-state-start', (obj) => {
            switch (obj.type) {
                case 1:
                    for (let b1 of obj.data) initBallObjs(b1)
                    balls = obj.data

                break

                case 2:
                    const image = new Image()
                    image.crossOrigin = "Anonymous";
                    image.src = window.location.origin + '/img/block-1.png'
                    obj.data.imgData = image

                    const size = obj.data.size
                    const space = obj.data.space
                    const col = obj.data.col

                    const screenWidth = (canvas.width / 2)
                    const startX = screenWidth - ((col * size + (col - 1) * space) / 2)

                    getBricks(obj.data.blocks, (block, x, y) => {
                        block.x = (x * size + x * space) + startX
                        block.y = y * size + y * space
                        block.size = size

                        if (block.imgUrl) {
                            const img = new Image()
                            img.crossOrigin = "Anonymous";
                            img.src = block.imgUrl
                            block.imageData = img
                        }
                    }, () => wall = obj.data)

                break

            }
        })

        socket.on('game-state-update', (obj) => {
            let found = false

            switch (obj.type) {
                case 1:
                    found = false
                    for (let b of balls) {
                        if (b.id === obj.data.id) {
                            initBallObjs(obj.data)

                            b = obj.data
                            found = true
                            break
                        }
                    }

                    if (!found) {
                        initBallObjs(obj.data)

                        balls.push(obj.data)
                    }

                break

                case 2:
                    if (wall) {
                        found = false
                        getBricks(wall.blocks, (block) => {
                            if (block.id === obj.data.id) {
                                block.userId = obj.data.userId
                                block.imgUrl = obj.data.imgUrl

                                if (block.imgUrl) {
                                    const img = new Image()
                                    img.crossOrigin = "Anonymous";
                                    img.src = block.imgUrl
                                    block.imageData = img
                                }
                                found = true
                                return true
                            }
                        }, () => {
                            if (!found) wall.blocks.push(obj.data)
                        })
                    }
                break
            }
        })
        anim()
    })

    socket.on('disconnect', (err) => {
        if (timerLatency) clearInterval(timerLatency)
        if (animId) cancelAnimationFrame(animId)
        balls = []
        wall = null
        console.log('Socket Disconnected!', err.toString())
    })

    //Animation Core

    function anim() {
        renderBackground()
        renderWall()
        renderLatency()
        renderBalls()
        renderParticleExplosion()
        
        animId = requestAnimationFrame(anim)
    }

    // Game Renders

    function renderWall() {
        if (wall) getBricks(wall.blocks, (block) => {
            if (block.status) {
                for (let ball of balls) {
                    updateBrickCollision(block, ball)
                }

                function drawDefault() {
                    try {
                        ctx.drawImage(wall.imgData, block.x, block.y, block.size, block.size)

                    } catch (err) {
                        ctx.fillStyle = block.color
                        ctx.fillRect(block.x, block.y, block.size, block.size)
                    }
                }

                if (block.imageData) {
                    try {
                        ctx.drawImage(block.imageData, block.x, block.y, block.size, block.size)
                    } catch (err) {
                        drawDefault()
                    }
                } else {
                    drawDefault()
                }
            }
        })
    }

    function renderBackground() {
        try {
            if (backgroundData.image) {
                ctx.drawImage(backgroundData.image, 0, 0, canvas.width, canvas.height)
            }
        } catch (err) {
            console.log(err)

            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
    }

    function renderParticleExplosion() {
        for(let i = 0; i < particles.length; i++) {
            particles[i].draw(ctx);
            
            // Simple way to clean up if the last particle is done animating
            if(i === particles.length - 1) {
              let percent = (Date.now() - particles[i].startTime) / particles[i].animationDuration[i];
              
              if(percent > 1) {
                particles = [];
              }
            }
          }
    }

    function renderLatency() {
        ctx.fillStyle = 'white'
        ctx.font = "18px Poppins";
        ctx.fillText(`${latency} ms`, 10, 24)
    }

    function renderBalls() {
        for (let ball of balls) {
            if (ball.status) {
                //Render Ball Position
                ball.x += ball.moveX
                ball.y += ball.moveY

                if (checkCollisionX(ball, canvas.width)) ball.moveX = -ball.moveX
                if (checkCollisionY(ball, canvas.height)) ball.moveY = -ball.moveY
                checkLimitCollision(ball, canvas.width, canvas.height)

                //Trail
                updateBallTrail(ball)

                /*for (let b2 of balls) {
                    if (ball !== b2 && ball.userId !== b2.userId && checkCollisionOtherBalls(ball, b2)) {
                        b2.status = false

                        socket.emit('update-state', { type : 2, data : b2 })
                        break
                    }
                }*/
                
                for (let i = 0; i < ball.trail.length; i += 4) {
                    const opacity = i / ball.trail.length;
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fillRect(ball.trail[i].x, ball.trail[i].y, ball.size, ball.size)
                }

                function drawDefault() {
                    ctx.fillStyle = ball.color
                    ctx.fillRect(ball.x, ball.y, ball.size, ball.size)
                }

                if (ball.imageData) {
                    try {
                        ctx.drawImage(ball.imageData, ball.x, ball.y, ball.size, ball.size)
                    } catch (err) {
                        drawDefault()
                    }
                } else {
                    drawDefault()
                }
            }
        }
    }

    //Game Collisions

    function updateBrickCollision(block, ball) {
        const brickCenterX = block.x + wall.size / 2;
        const brickCenterY = block.y + wall.size / 2;
        const ballCenterX = ball.x + ball.size / 2;
        const ballCenterY = ball.y + ball.size / 2;
        const dx = ballCenterX - brickCenterX;
        const dy = ballCenterY - brickCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (ball.size + wall.size) / 2) {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (checkWallColissionX(ball, dx)) ball.moveX = -ball.moveX
            } else {
                if (checkWallColissionY(ball, dy)) ball.moveY = -ball.moveY
            }

            //Generate Particle
            spawnParticles(block.x, block.y)
            
            block.status = false
            socket.emit('update-state', { type : 1, data : block })
        }
    }

    function checkWallColissionX(ball, dx) {
        return ((ball.moveX > 0 && dx < 0) || (ball.moveX < 0 && dx > 0))
    }

    function checkWallColissionY(ball, dy) {
        return ((ball.moveY > 0 && dy < 0) || (ball.moveY < 0 && dy > 0))
    }

    function checkCollisionX(ball, w) {
        return ball.x + ball.size >= w || ball.x <= 0
    }

    function checkCollisionY(ball, h) {
        return ball.y + ball.size >= h || ball.y <= 0
    }

    function checkLimitCollision(ball, w, h) {
        if (ball.x < 0) ball.x = 10
        if (ball.y <= 0) ball.y = 10
        if (ball.x > w) ball.x = w * 0.9
        if (ball.y > h) ball.y = h * 0.9
    }

    function checkCollisionOtherBalls(b1, b2) {
        const distanciaCentros = Math.sqrt((b2.x - b1.x) ** 2 + (b2.y - b1.y) ** 2);
        return distanciaCentros <= (b1.size + b2.size);
    }


    //Utils

    function spawnParticles(x, y) {
        let c = 0, max = 4

        if (x !== 0 && y !== 0) {
            const data = ctx.getImageData(0, 0, x, y).data

            while (c++ <= max) {
                let particle = new Particle(x, y, 8, 10)
                particle.setRgb(data)
                particles.push(particle)
            }
        }
    }

    function initBallObjs(b1) {
        b1.trail = []
        b1.x = Math.random() * canvas.width
        b1.y = Math.random() * canvas.height

        if (b1.imgUrl) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = b1.imgUrl;
            b1.imageData = img
        }
    }

    function updateBallTrail(ball) {
        ball.trail.push({ x : ball.x, y : ball.y});
        if (ball.trail.length > ball.trailLen) {
            ball.trail.shift();
        }
    }

    function getBricks(arr, callbak, finish) {
        if (arr) {
            let result = null
            for (let x = 0; x < arr.length; x++) {
                for (let y = 0; y < arr[x].length; y++) {
                    result = callbak(arr[x][y], x, y)
                    if (result) return finish ? finish() : null
                }
            }
        }
        if (finish) finish()
    }

})