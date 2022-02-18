const utils = require('../../utils');

module.exports = utils.addTable('channels', {
    id: {type: 'string', maxlength: 24, nullable: false, primary: true},
    active: {type: 'boolean', nullable: false, defaultTo: true},
    name: {type: 'string', maxlength: 191, nullable: false, unique: true},
    slug: {type: 'string', maxlength: 191, nullable: false},
    description: {type: 'text', maxlength: 65535, nullable: true, validations: {isLength: {max: 500}}},
    route: {type: 'string', maxlength: 2000, nullable: true},
    type: {type: 'string', maxlength: 50, nullable: false, validations: {isIn: [['automated', 'manual']]}},
    filter: {type: 'string', maxlength: 2000, nullable: true},
    accent_color: {type: 'string', maxlength: 50, nullable: true},
    feature_image: {type: 'string', maxlength: 2000, nullable: true},
    feature_image_alt: {type: 'string', maxlength: 191, nullable: true, validations: {isLength: {max: 125}}},
    feature_image_caption: {type: 'text', maxlength: 65535, nullable: true},
    meta_title: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 300}}},
    meta_description: {type: 'string', maxlength: 2000, nullable: true, validations: {isLength: {max: 500}}},
    og_image: {type: 'string', maxlength: 2000, nullable: true},
    og_title: {type: 'string', maxlength: 300, nullable: true},
    og_description: {type: 'string', maxlength: 500, nullable: true},
    twitter_image: {type: 'string', maxlength: 2000, nullable: true},
    twitter_title: {type: 'string', maxlength: 300, nullable: true},
    twitter_description: {type: 'string', maxlength: 500, nullable: true},
    created_at: {type: 'dateTime', nullable: false},
    updated_at: {type: 'dateTime', nullable: true}
});
