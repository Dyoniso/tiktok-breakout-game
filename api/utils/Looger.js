const winston = require('winston')

let cyan = "\x1b[36m"
let reset = "\x1b[0m"
let red = "\x1b[31m"
let yellow = "\x1b[33m"

let bgBlue = "\x1b[44m"
let bgRed = "\x1b[41m"

const logLevels = {
  levels: {
      debug: 4,
      info: 2,
      warn: 3,
      error: 1,
      fatal: 0,
  }
}

dateFormat = () => {
  return new Date(Date.now()).toUTCString()
}

class LoggerService {
  constructor(route) {
    this.log_data = null
    this.route = route
    const logger = winston.createLogger({
      levels: logLevels.levels,
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: `./logs/${route}.log`
        }),
        new winston.transports.File({
          filename: `./logs/crash.log`,
          level: 'fatal',
        })
      ],
      format: winston.format.printf((info) => {
        let strRoute = info.level === 'fatal' ? 'crash.log' : route + '.log'
        let b64 = this.log_data ? this.log_data.base64 : null
        if (b64 && b64.length > 300) this.log_data.base64 = b64.substring(0, 300) + '...'

        let strInfo = info.level === 'info' ? bgBlue + info.level.toUpperCase() : bgRed + info.level.toUpperCase()
        let message = `${cyan}${dateFormat()} ${reset}| ${strInfo}${reset} |${red} ${strRoute} ${reset}| ${info.message} | `
        message = info.obj ? message + `${info.level === 'fatal' ? `${red}exeption:${JSON.stringify(info.obj)}` : `${yellow}data:${JSON.stringify(info.obj)}`} ${reset}| ` : message
        message = this.log_data ? message + `${yellow}log_data:${JSON.stringify(this.log_data)} ${reset}| ` : message
        return message
      })
   });
   this.logger = logger
}

setLogData(log_data) {
  this.log_data = Object.assign({}, log_data)
}
async info(message) {
  this.logger.log('info', message);
}
async info(message, obj) {
  this.logger.log('info', message, {
    obj
  })
}
async debug(message) {
  this.logger.log('debug', message);
}
async debug(message, obj) {
  this.logger.log('debug', message, {
    obj
  })
}
async error(message) {
  this.logger.log('error', message);
}
async error(message, obj) {
  this.logger.log('error', message, {
    obj
  })
}
async fatal(message) {
  this.logger.log('fatal', message);
}
async fatal(message, obj) {
  this.logger.log('fatal', message, {
    obj
  })
}
async igr(message) {
  console.log(`${cyan}${dateFormat()} ${reset}| ${bgBlue}IGR${reset} | ${message} | `)
}
}
module.exports = LoggerService