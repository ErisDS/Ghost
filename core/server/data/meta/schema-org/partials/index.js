const fs = require('fs-extra');
const path = require('path');

module.exports = {
    image: fs.readFileSync(path.join(__dirname, '/image.hbs')).toString(),
    main_entity: fs.readFileSync(path.join(__dirname, '/main_entity.hbs')).toString(),
    publisher: fs.readFileSync(path.join(__dirname, '/publisher.hbs')).toString()
};
