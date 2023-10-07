const { v4: uuidv4 } = require('uuid')

module.exports = class Ball {
    constructor(size, maxSize, minSize, speed, maxSpeed, color) {
        this.id = uuidv4()
        
        this.minSize = minSize
        this.size = size
        this.maxSize = maxSize

        this.speed = speed
        this.maxSpeed = maxSpeed

        this.moveX = speed
        this.moveY = speed
        this.color = color
        this.status = true

        this.level = 1
        this.msg = 'GO GO GO'
        this.msgLife = 80
        this.invincibleTime = 40
        this.combo
    }

    registerUser(userId, imgUrl) {
        this.userId = userId
        this.imgUrl = imgUrl
    }

    addSpeed(speed) {
        this.speed += speed
        if (this.speed > this.maxSpeed) this.speed = this.maxSpeed
    }

    addSize(size) {
        this.size += size
        if (this.size > this.maxSize) this.size = this.maxSize
        if (this.size < this.minSize) this.size = this.minSize
        this.level++
    }
}