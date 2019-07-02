const config = require('../../config');
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

const log4js = require('log4js');

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

console.log(config.get('logging'));

log4js.configure(
    {
        appenders: {
            out: {type: 'stdout', layout: {type: 'pattern', pattern: '[%d{yyyy-MM-dd hh:mm:ss O}] %[%p%] %m'}},
            access: {type: 'file', filename: 'test', maxsize: 10 * 1024 * 1024, backups: 20},
            errors: {type: 'file', filename: 'test.error', maxsize: 10 * 1024 * 1024, backups: 20},
            errorsOnly: {type: 'logLevelFilter', appender: 'errors', level: 'error'}
        },
        categories: {default: {appenders: ['out', 'access', 'errorsOnly'], level: 'debug'}},
        levels
    });

const logger = log4js.getLogger('default');

logger.request = log4js.connectLogger(logger, {level: 'auto', format: ':method :url :status :response-timems'});

module.exports = logger;
