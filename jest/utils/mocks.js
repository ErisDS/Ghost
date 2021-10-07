module.exports.mail = () => {
    const mail = require('../../core/server/services/mail');
    return jest.spyOn(mail.GhostMailer.prototype, 'send').mockImplementation(() => {
        return new Promise((res) => {
            res('Mail is disabled');
        });
    });
};

module.exports.restoreAll = () => {
    jest.restoreAllMocks();
};
