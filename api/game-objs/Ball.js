const { v4: uuidv4 } = require('uuid')

module.exports = class Ball {
    constructor(size, maxSize, speed, color) {
        this.id = uuidv4()
        
        this.minSize = 15
        this.size = size
        this.maxSize = maxSize

        this.speed = speed

        this.moveX = speed
        this.moveY = speed
        this.color = color
        this.status = true

        this.level = 1
    }

    registerUser(userId, imgUrl) {
        this.userId = userId
        this.imgUrl = imgUrl
    }

    addSpeed(speed) {
        if (this.speed <= 50) {
            this.speed += speed
        }
    }

    addSize(size) {
        if (this.size <= this.maxSize) {
            this.size += size
            this.level++;
        }
    }
}