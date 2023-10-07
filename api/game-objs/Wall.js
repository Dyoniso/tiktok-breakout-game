const { v4: uuidv4 } = require('uuid')

class Block {
    constructor(color) {
        this.id = uuidv4()
        this.color = color
        this.msg = null
        this.reset()
    }

    setMsg(m) {
        this.msg = m
    }

    isNotUser() {
        return !this.userId
    }

    registerUser(userId, imgUrl) {
        this.userId = userId
        this.imgUrl = imgUrl
    }

    reset() {
        this.userId = null
        this.imgUrl = null
        this.status = true
    }

    break() {
        this.status = false
    }
}

module.exports = class Wall {
    constructor(size, space, col, row, color) {
        this.size = size
        this.space = space
        this.col = col
        this.row = row
        this.color = color

        this.blocks = []
        for (let x = 0; x < this.col; x++) {
            this.blocks[x] = []
            for (let y = 0; y < this.row; y++) {
                this.blocks[x][y] = new Block(this.color)
            }
        }
    }

    getBlocks(callback, finish) {
        let result = null
        for (let x = 0; x < this.col; x++) {
            for (let y = 0; y < this.row; y++) {
                result = callback(this.blocks[x][y])

                if (result) return
            }
        }
        if (finish) finish()
    }

    replaceBlock(obj) {
        this.getBlocks((block) => {
            if (obj.id === block.id) {
                return block.status = obj.status
            }
        })
    }
}