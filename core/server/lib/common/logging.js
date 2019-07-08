// const config = require('../../config');
// //     {logging} = require('ghost-ignition');

// // module.exports = logging({
// //     name: config.get('logging:name'),
// //     env: config.get('env'),
// //     path: config.get('logging:path') || config.getContentPath('logs'),
// //     domain: config.get('url'),
// //     mode: config.get('logging:mode'),
// //     level: config.get('logging:level'),
// //     transports: config.get('logging:transports'),
// //     gelf: config.get('logging:gelf'),
// //     loggly: config.get('logging:loggly'),
// //     rotation: config.get('logging:rotation')
// // });

// const log4js = require('log4js');

const levels = {
    ALL: {value: -10, colour: 'grey'},
    TRACE: {value: 10, colour: 'grey'},
    DEBUG: {value: 20, colour: 'grey'},
    INFO: {value: 30, colour: 'cyan'},
    WARN: {value: 40, colour: 'yellow'},
    ERROR: {value: 50, colour: 'red'},
    FATAL: {value: 60, colour: 'magenta'},
    OFF: {value: 100, colour: 'grey'}
};

// PATTERN: {type: 'pattern', pattern: '[%d{yyyy-MM-dd hh:mm:ss O}] %[%p%] %m'}
// console.log(config.get('logging'));

// // let data = info.message;
// //             info.message = require('util')
// //                 .format('"%s %s" %s %s',
// //                     data.req.method.toUpperCase(),
// //                     data.req.originalUrl,
// //                     data.res.statusCode,
// //                     data.res.responseTime
// //                 );

// //             return info;

// log4js.addLayout('json', function (config) {
//     return function (logEvent) {
//         console.log(logEvent, config);
//      a   return JSON.stringify(logEvent) + config.separator;
//     };
// });

// log4js.configure(
//     {
//         appenders: {
//             out: {type: 'stdout', layout: {type: 'basic'}},
//             access: {type: 'file', filename: 'test', maxsize: 10 * 1024 * 1024, backups: 20},
//             errors: {type: 'file', filename: 'test.error', maxsize: 10 * 1024 * 1024, backups: 20},
//             errorsOnly: {type: 'logLevelFilter', appender: 'errors', level: 'error'},
//             gelf: {type: '@log4js-node/gelf', host: '134.209.202.203', port: 12201, facility: 'ghost-log-test', layout: {type: 'dummy'}, customFields: {_foo: 'bar'}}
//         },
//         categories: {default: {appenders: ['out', 'access', 'errorsOnly', 'gelf'], level: 'debug'}},
//         levels
//     });

// const logger = log4js.getLogger('default');

// logger.request = log4js.connectLogger(logger, {level: 'auto', format: '":method :url" :status :response-timems'});

// //module.exports = logger;

// logger.info('hello world');

// --------

const log4js = require('log4js');
const _ = require('lodash');

// const serialize = function (data) {
//     data.forEach((arg) => {
//         if (_.isObject(arg)) {

//         } else if (_.isString(entry)) {

//         }
//     });
// };

// log4js.addLayout('gelf', function (config) {
//     return function (logEvent) {
//         console.log(logEvent, config);
//         return JSON.stringify(logEvent) + config.separator;
//     };
// });

// log4js.addLayout('cli', function (config) {
//     return function (logEvent) {
//         console.log(logEvent, config);
//         return JSON.stringify(logEvent) + config.separator;
//     };
// });

// log4js.addLayout('json', function (config) {
//     return function (logEvent) {
//         console.log(logEvent, config);
//         return JSON.stringify(logEvent) + config.separator;
//     };
// });

const config = {
    appenders: {
        out: {type: 'stdout', layout: {type: 'pattern', pattern: '[%d{yyyy-MM-dd hh:mm:ss O}] %[%p%] %m', tokens: {
            message: function (logEvent) {
                let data = logEvent.data;

                // console.log(logEvent);
                if (data.length === 1 && data[0] instanceof Error) {
                    return data[0];
                }

                if (data.length === 1 && _.isString(data[0])) {
                    return data[0];
                }
                console.log('data', data);
                //             info.message = require('util')
                //                 .format('"%s %s" %s %s',
                //                     data.req.method.toUpperCase(),
                //                     data.req.originalUrl,
                //                     data.res.statusCode,
                //                     data.res.responseTime
                //                 );

                //             return info;
                //return logEvent.data[0];
            }
        }}},
        access: {type: 'file', filename: 'logs/test.log', maxLogSize: 1 * 1024 * 1024, backups: 4}
    },
    categories: {default: {appenders: ['access', 'out'], level: 'debug', enableCallStack: true}},
    levels
};

log4js.configure(config);

const logger = log4js.getLogger('default');

logger.info('hello world 1');
logger.error(new Error('bad thing 1'));
logger.warn(config, 'big obj first');
logger.warn('big obj last', config);

process.on('uncaughtException', function (error) {
    logger.fatal(error);
    log4js.shutdown(() => {
        process.nextTick(() => process.exit(-1));
    });
});

logger.shutdown = log4js.shutdown;

module.exports = logger;
