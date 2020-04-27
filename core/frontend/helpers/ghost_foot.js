// # Ghost Foot Helper
// Usage: `{{ghost_foot}}`
//
// Outputs scripts and other assets at the bottom of a Ghost theme
const {SafeString, settingsCache} = require('../services/proxy');
const _ = require('lodash');

// We use the name ghost_foot to match the helper for consistency:
module.exports = function ghost_foot(options) { // eslint-disable-line camelcase
    var foot = [],
        globalCodeinjection = settingsCache.get('ghost_foot'),
        postCodeinjection = options.data.root && options.data.root.post ? options.data.root.post.codeinjection_foot : null;

    if (!_.isEmpty(globalCodeinjection)) {
        foot.push(globalCodeinjection);
    }

    if (!_.isEmpty(postCodeinjection)) {
        foot.push(postCodeinjection);
    }

    console.log('footer', options.data.site);
    if (options.data.site._preview) {
        let script = `<script>
        window.onunload = function (e) {
            e.preventDefault();
            console.log('on unload', e.currentTarget.window.location.href);
            // Notify top window of the unload event
            window.top.postMessage({name: 'iframe_change_unload', url: e.currentTarget.window.location.href}, '*');
        };

        window.onload = function (e) {
            e.preventDefault();
            console.log('on load', e.currentTarget.window.location.href);
            // Notify top window of the unload event
            window.top.postMessage({name: 'iframe_change_load', url: e.currentTarget.window.location.href}, '*');
        };

        window.onbeforeunload = function (e) {
            e.preventDefault();
            console.log('on onbeforeunload', e.currentTarget.window.location.href);
            // Notify top window of the unload event
            window.top.postMessage({name: 'iframe_change_load', url: e.currentTarget.window.location.href}, '*');
        };
        </script>`;
        foot.push(script);
    }

    return new SafeString(foot.join(' ').trim());
};
