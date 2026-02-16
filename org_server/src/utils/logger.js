import winston from 'winston';
const { format, transports } = winston;

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.colorize({ all: true }),
        format.timestamp({
            format: 'YYYY-MM-DD hh:mm:ss.SSS A',
        }),
        format.align(),
        format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: format.uncolorize()
        }),
        new transports.File({
            filename: 'logs/combined.log',
            format: format.uncolorize()
        })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: 'logs/exceptions.log',
            format: format.uncolorize()
        })
    ]
});

const stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};

export default logger;
export const loggerStream = stream;
export const info = logger.info.bind(logger);
export const error = logger.error.bind(logger);