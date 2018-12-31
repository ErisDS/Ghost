const fs = require('fs-extra');
const path = require('path');

module.exports = {
    home: fs.readFileSync(path.join(__dirname, '/home.hbs')).toString(),
    post: fs.readFileSync(path.join(__dirname, '/post.hbs')).toString(),
    author: fs.readFileSync(path.join(__dirname, '/author.hbs')).toString(),
    tag: fs.readFileSync(path.join(__dirname, '/tag.hbs')).toString()
};
