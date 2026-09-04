const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const servicesPath = path.join(__dirname, '../../../../core/server/services');

const managedLifecycleServiceRoots = [
    'remote-flags'
];

// These roots acquire timers, workers, subscriptions, schedulers, listeners,
// or external resources, but have not yet moved onto the managed lifecycle.
// Keep the debt explicit instead of misclassifying them as composition-only.
const legacyLifecycleServiceRoots = [
    'activitypub',
    'automations',
    'email-analytics',
    'email-service',
    'email-suppression-list',
    'gifts',
    'jobs',
    'link-tracking',
    'member-welcome-emails',
    'members',
    'members-events',
    'mentions',
    'mentions-jobs',
    'milestones',
    'offers',
    'post-scheduling',
    'recommendations',
    'route-settings',
    'slack-notifications',
    'staff',
    'stripe',
    'webhooks'
];

const compositionOnlyServiceRoots = [
    'adapter-manager',
    'announcement-bar-service',
    'audience-feedback',
    'comments',
    'custom-redirects',
    'donations',
    'email-address',
    'explore-ping',
    'gift-links',
    'identity-tokens',
    'indexnow-ping',
    'internal-keys',
    'invites',
    'link-redirection',
    'machine-payments',
    'media-inliner',
    'member-attribution',
    'members-custom-fields',
    'newsletters',
    'notifications',
    'oembed',
    'permissions',
    'posts',
    'posts-public',
    'settings',
    'settings-helpers',
    'slack-ping',
    'stats',
    'tags-public',
    'themes',
    'tiers',
    'tinybird',
    'url'
];

const serviceRoots = [
    ...managedLifecycleServiceRoots,
    ...legacyLifecycleServiceRoots,
    ...compositionOnlyServiceRoots
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

    it.each(managedLifecycleServiceRoots)('%s exposes managed shutdown', function (serviceName) {
        const servicePath = path.join(servicesPath, serviceName);
        const entryPath = ['index.ts', 'index.js']
            .map(fileName => path.join(servicePath, fileName))
            .find(fileName => fs.existsSync(fileName));
        const source = fs.readFileSync(entryPath, 'utf8');

        if (entryPath.endsWith('.ts')) {
            assert.match(source, /export const shutdown\b/);
        } else {
            assert.match(source, /module\.exports\s*=\s*\{[\s\S]*\bshutdown\b[\s\S]*\}/);
        }
    });
});
