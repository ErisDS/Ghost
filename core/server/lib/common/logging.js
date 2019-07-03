// const config = require('../../config'),
//     {logging} = require('ghost-ignition');

// module.exports = logging({
//     name: config.get('logging:name'),
//     env: config.get('env'),
//     path: config.get('logging:path') || config.getContentPath('logs'),
//     domain: config.get('url'),
//     mode: config.get('logging:mode'),
//     level: config.get('logging:level'),
//     transports: config.get('logging:transports'),
//     gelf: config.get('logging:gelf'),
//     loggly: config.get('logging:loggly'),
//     rotation: config.get('logging:rotation')
// });

const {createLogger, format, transports, addColors} = require('winston');
const GelfTransport = require('winston-gelf-pro');

const customLevels = {
    levels: {
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0
    },
    colors: {
        trace: 'grey',
        debug: 'grey',
        info: 'cyan',
        warn: 'yellow',
        error: 'red',
        fatal: 'magenta'
    }
};
const logger = createLogger({
    levels: customLevels.levels,
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({stack: true}),
        format((info) => {
            if (typeof info.message !== 'object' || !info.message.req || !info.message.res) {
                return info;
            }

            let data = info.message;
            info.message = require('util')
                .format('"%s %s" %s %s',
                    data.req.method.toUpperCase(),
                    data.req.originalUrl,
                    data.res.statusCode,
                    data.res.responseTime
                );

            return info;
        })(),
        format.json()
    ),
    transports: [
        new transports.File({filename: 'test.error.log', level: 'error', maxsize: 10 * 1024 * 1024, maxfiles: 10}),
        new transports.File({filename: 'test.combined.log', level: 'info', maxsize: 10 * 1024 * 1024, maxfiles: 10}),
        new GelfTransport({name: 'ghost', level: 'info', graylog: {servers: [{host: '134.209.202.203', port: 12201}], facility: 'ghost'}})
    ]
});

addColors(customLevels.colors);

if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.errors({stack: true}),
            format.colorize(),
            format.printf(info => `${info.timestamp} ${info.level} ${info.stack ? info.stack : info.message}`))
    }));
}

// logger.on('finish', function (info) {
//     // All `info` log messages has now been logged
//     process.exit();
// });

logger.info('test', {foo: 'bar'});

// logger.end();
//module.exports = logger;
