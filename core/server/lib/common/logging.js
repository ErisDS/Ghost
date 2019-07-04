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

// let config = {
//     appenders: {
//         out: {type: 'stdout', layout: {type: 'basic'}},
//         access: {type: 'file', filename: 'test', maxsize: 10 * 1024 * 1024, backups: 20},
//         errors: {type: 'file', filename: 'test.error', maxsize: 10 * 1024 * 1024, backups: 20},
//         errorsOnly: {type: 'logLevelFilter', appender: 'errors', level: 'error'},
//         gelf: {type: '@log4js-node/gelf', host: '134.209.202.203', port: 12201, facility: 'ghost-log-test', layout: {type: 'dummy'}, customFields: {_foo: 'bar'}}
//     },
//     categories: {default: {appenders: ['out', 'access', 'errorsOnly', 'gelf'], level: 'debug'}},
//     levels
// };

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
const config = {
    appenders: {
        access: {type: 'file', filename: 'test.log', maxLogSize: 5, backups: 10}
    },
    categories: {default: {appenders: ['access'], level: 'debug'}}
};

log4js.configure(config);

const logger = log4js.getLogger('default');

logger.info('hello world');
logger.error(new Error('bad things'));
logger.debug('stuff', config);
logger.warn(config, 'more stuff');

logger.info('hello world');
logger.error(new Error('bad things'));
logger.debug('stuff', config);
logger.warn(config, 'more stuff');
logger.info('hello world');
logger.error(new Error('bad things'));
logger.debug('stuff', config);
logger.warn(config, 'more stuff');
logger.info('hello world');
logger.error(new Error('bad things'));
logger.debug('stuff', config);
logger.warn(config, 'more stuff');
logger.info('hello world');
logger.error(new Error('bad things'));
logger.debug('stuff', config);
logger.warn(config, 'more stuff');
