const winston = require("winston");
require("winston-mongodb");
const config = require("config");
const path = require("path");
const moment = require('moment');
const morgan = require("morgan");

const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: () => moment().format('YYYY-MM-DD HH:mm:ss')
    }),
    winston.format.printf(({ timestamp, level, message, label }) => {
        return `[${timestamp}] - [${level.toUpperCase()}] - ${message}`;
    })
);

let logger = null;

function initializeLogger() {
    if (!logger) {
        const logFilePath = config.get("logFilePath");
        const infoLogFilePath = path.resolve(__dirname, `${logFilePath}/combined.log`);
        const errorLogFilePath = path.resolve(__dirname, `${logFilePath}/errors.log`);

        console.log(errorLogFilePath);
        
        const logLevel = config.get("logLevel");

        let transports = [
            new winston.transports.Console({ format: logFormat, level: logLevel }),
            new winston.transports.File({
                filename: errorLogFilePath,
                level: "warn",
                format: logFormat
            })
        ];

        if(logLevel != "error" && logLevel != "warn") {
            transports.push(
                new winston.transports.File({
                    filename: infoLogFilePath,
                    level: "info",
                    format: logFormat
                })
            );
        }

        const mongoLogConnString = config.get("mongoLogConnString");
        if(config.get("logToMongo") && mongoLogConnString) {
            transports.push(new winston.transports.MongoDB({
                db: mongoLogConnString,
                level: "error"
            }));
        }

        logger = winston.createLogger({ transports: transports });

        process.on("uncaughtException", (ex) => {
            logger.error("Unhandled Exception!", ex);
            process.exit(1);
        });

        process.on("unhandledRejection", (ex) => {
            logger.error("Unhandled Promise rejection!", ex);
            process.exit(1);
        });
    }

    return logger;
}

const morganStream = {
    write: (message) => initializeLogger().info(message.trim())
};
const customMorganFormat = '[:method] (:remote-addr) - :url - [:status] - :res[content-length] - :response-time ms';
const morganMiddleware = morgan(customMorganFormat, { stream: morganStream });

module.exports.logger = initializeLogger();
module.exports.morganMiddleware = morganMiddleware;
