module.exports = class Util {
    static getRandomRGB() {
        const red = Math.floor(Math.random() * 256);  // Valor aleatório entre 0 e 255
        const green = Math.floor(Math.random() * 256);  // Valor aleatório entre 0 e 255
        const blue = Math.floor(Math.random() * 256);  // Valor aleatório entre 0 e 255
        
        return `rgba(${red}, ${green}, ${blue}, 1)`
    }
}