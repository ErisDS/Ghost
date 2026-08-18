const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const servicesPath = path.join(__dirname, '../../../../core/server/services');

const serviceRoots = [
    'activitypub',
    'adapter-manager',
    'announcement-bar-service',
    'audience-feedback',
    'automations',
    'comments',
    'custom-redirects',
    'donations',
    'email-address',
    'email-analytics',
    'email-service',
    'email-suppression-list',
    'explore-ping',
    'gift-links',
    'gifts',
    'identity-tokens',
    'indexnow-ping',
    'internal-keys',
    'invites',
    'jobs',
    'link-redirection',
    'link-tracking',
    'machine-payments',
    'media-inliner',
    'member-attribution',
    'member-welcome-emails',
    'members',
    'members-custom-fields',
    'members-events',
    'mentions',
    'mentions-jobs',
    'milestones',
    'newsletters',
    'notifications',
    'oembed',
    'offers',
    'permissions',
    'post-scheduling',
    'posts',
    'posts-public',
    'recommendations',
    'remote-flags',
    'route-settings',
    'settings',
    'settings-helpers',
    'slack-notifications',
    'slack-ping',
    'staff',
    'stats',
    'stripe',
    'tags-public',
    'themes',
    'tiers',
    'tinybird',
    'url',
    'webhooks'
];

// These currently live under services/ but are modules, subsystems, actions,
// infrastructure, or support directories rather than runtime services.
const nonServiceRoots = [
    'api-version-compatibility',
    'auth',
    'email-rendering',
    'files',
    'integrations',
    'invitations',
    'lib',
    'mail',
    'public-config',
    'update-check',
    'verification'
];

describe('Service roots', function () {
    it('classifies every top-level directory', function () {
        const directories = fs.readdirSync(servicesPath, {withFileTypes: true})
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name)
            .sort();

        const classifiedDirectories = [...serviceRoots, ...nonServiceRoots].sort();

        assert.deepEqual(classifiedDirectories, directories);
    });

    it.each(serviceRoots)('%s exposes the standard service contract', function (serviceName) {
        const servicePath = path.join(servicesPath, serviceName);
        const entryPath = ['index.ts', 'index.js']
            .map(fileName => path.join(servicePath, fileName))
            .find(fileName => fs.existsSync(fileName));
        const source = fs.readFileSync(entryPath, 'utf8');

        if (entryPath.endsWith('.ts')) {
            assert.match(source, /export (?:async )?(?:const|function) init\b/);
            assert.match(source, /export const service\b/);
        } else {
            assert.match(source, /module\.exports\s*=\s*\{[\s\S]*\binit\b[\s\S]*\bservice\b[\s\S]*\}/);
        }
    });
});
