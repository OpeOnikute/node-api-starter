const winston = require('winston');
const { format } = winston;

const enumerateErrorFormat = format(info => {
    if (info.message instanceof Error) {
        info.message = Object.assign({
        message: info.message.message,
        stack: info.message.stack
        }, info.message);
    }

    if (info instanceof Error) {
        return Object.assign({
        message: info.message,
        stack: info.stack
        }, info);
    }

    return info;
});

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    enumerateErrorFormat(),
    format.json()
  ),
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `app.log`
    //
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app.log' }),
  ],
});

class LogHandler {

    constructor (){
        this.logger = logger;
    }

    log (level, info) {
        switch (level) {
            case "info":
            case "error":
                this.logger.log(level, info);
                break;
            default:
                this.logger.log("error", `Unkown log level ${level}.`)
                break;
        }
    }
}

module.exports = new LogHandler();