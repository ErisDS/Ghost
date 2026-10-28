'use strict';

const { readFileSync } = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { sourceExclusions } = require('./tools/scripts/lib/service-dependency-resolver.mjs');

// Keep service policy here. The audit applies it to every service; normal lint
// applies it only to entries marked migrated in the inventory.
const servicesRoot = 'ghost/core/server/services';
const auditServices = process.env.GHOST_SERVICE_DEPENDENCY_AUDIT === '1';
const { services } = yaml.load(
  readFileSync(path.join(__dirname, servicesRoot, 'service-inventory.yaml'), 'utf8'),
);
const migratedServices = Object.entries(services)
  .filter(([, entry]) => entry.migrated === true)
  .map(([name]) => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
const serviceImplementations = {
  path: `^${servicesRoot}/(${auditServices ? '[^/]+' : migratedServices || '(?!)'})(?:/|$)`,
  pathNot: `^${servicesRoot}/[^/]+/index\\.${auditServices ? '(?:js|ts)' : 'ts'}$`,
};

// Domains: one directory per bounded context under ghost/domains. domain.ts is
// the wiring root (the only file that may reach into legacy application code),
// index.ts the only surface other code may import. Everything else is
// implementation and follows the same dependency rule as migrated services.
const domainsRoot = 'ghost/domains';
const domainImplementation = {
  path: `^${domainsRoot}/([^/]+)/`,
  pathNot: [`^${domainsRoot}/[^/]+/domain\\.ts$`, '\\.test\\.(js|ts)$'],
};
// Legacy application code each domain's domain.ts may still wire by hand.
// Per domain, named individually, and expected to shrink per entry; it grows
// only when a new root moves into the domain and each addition is reviewed.
const domainLegacyAllowlist = {
  payments: [
    '^ghost/core/server/models/index\\.js$', // Bookshelf model registry, frozen; the domain takes single models from it.
    // Future domains, reached as legacy roots until they exist. Each entry
    // becomes an index.ts import when its domain is created.
    '^ghost/core/server/services/(members|tiers|staff|stripe|settings-helpers|i18n)(/index\\.(js|ts))?$',
    '^ghost/core/server/services/email-address/email-address-parser\\.(js|ts)$',
    '^ghost/core/server/services/email-analytics/jobs(/index\\.(js|ts))?$',
    // Shared libraries and singletons awaiting a kernel or domain home.
    '^ghost/core/server/lib/(mail|image)(/index\\.(js|ts))?$',
    '^ghost/core/server/lib/mailgun/mailgun-client\\.(js|ts)$',
    '^ghost/core/shared/(config|settings-cache|url-utils|events)(/index\\.(js|ts))?$',
    '(^|/)node_modules/@tryghost/(logging|domain-events)/|^@tryghost/(logging|domain-events)$',
  ],
};
// Implementation debt a domain carries into the move: application instances its
// files still import directly instead of taking as dependencies. Per domain,
// named individually, and only ever removed. A domain with an empty list is
// clean; a root cannot be marked migrated in the services inventory while its
// future domain still lists it here.
const domainImplementationDebt = {
  payments: [
    '(^|/)node_modules/@tryghost/logging/|^@tryghost/logging$', // gifts: gift-service, gift-delivery-service, gift-checkout-adapter, jobs/index
    '(^|/)node_modules/@tryghost/domain-events/|^@tryghost/domain-events$', // gifts: gift-delivery-service dispatches directly
  ],
};

// Explicit code-library and contract allowances, not application instances.
// Keep each package or file named individually and explain additions here.
const serviceDependencyAllowlist = [
  '(^|/)node_modules/@tryghost/errors/|^@tryghost/errors$', // Error classes and formatting.
  '(^|/)node_modules/@tryghost/tpl/|^@tryghost/tpl$', // Message interpolation.
  '(^|/)node_modules/zod/|^zod$', // Schema construction and validation.
  '(^|/)node_modules/bson-objectid/|^bson-objectid$', // ObjectId generation and conversion.
  '^@tryghost/app-contracts/manifest$|^packages/app-contracts/(src|build)/manifest/index\\.(ts|js)$', // Shared manifest schemas and validation.
  '^(node:)?crypto$', // Cryptographic algorithms and key generation.
  '^(node:)?util$', // Node utilities, including promisify.
  '^ghost/core/kernel/clock\\.ts$', // Shared clock helpers and legacy date compatibility.
  '^ghost/core/server/lib/db-types/date\\.ts$', // Database date codec.
  '^ghost/core/server/lib/db-types/boolean\\.ts$', // Database boolean codec.
  '^ghost/core/server/lib/db-types/json\\.ts$', // Database JSON codec.
  '^ghost/core/server/lib/public-jwk\\.ts$', // Key conversion and thumbprints; includes memoization.
  '^ghost/core/server/services/jobs-service/job\\.ts$', // Job base class, not the running service.
  // Added with the gifts move. Pure libraries and helpers; kernel-tier candidates.
  '(^|/)node_modules/luxon/|^luxon$', // Date arithmetic.
  '(^|/)node_modules/handlebars/|^handlebars$', // Template compilation for the domain's own templates.
  '(^|/)node_modules/@tryghost/mongo-utils/|^@tryghost/mongo-utils$', // Filter transformers.
  '(^|/)node_modules/@tryghost/color-utils/|^@tryghost/color-utils$', // Colour parsing for email rendering.
  '^(node:)?fs$', // Template files shipped with the domain.
  '^(node:)?path$',
  '^ghost/core/server/lib/case-keys\\.ts$', // Key case codecs.
  '^ghost/core/server/lib/mailgun/mailgun-message-id\\.ts$', // Message-id helper, no client.
  '^ghost/core/server/adapters/scheduling/signed-flush-scheduler\\.ts$', // Scheduler helper class, not an adapter instance.
];

/*
 * Architectural boundary rules for the monorepo, enforced on the resolved
 * module graph (require AND import). Two sections:
 *
 *   ghost  — layer separation inside the Ghost server: shared/ must stay
 *                 dependency-free, frontend/ crosses to server/ only via the
 *                 proxy seam, and server/ must not reach into the frontend
 *                 rendering layer. Paths are anchored on `^ghost/core/`.
 *
 *   apps/       — design system layer hierarchy and public/admin separation.
 *                 shade/ is a leaf package that nothing above it may pull
 *                 back into. admin-x-framework/ sits above it but below
 *                 feature apps. Public UMD bundles (portal, comments-ui,
 *                 etc.) must not depend on admin libs.
 *
 *                 Workspace imports may resolve to source through package exports.
 *                 Match both package specifiers and workspace paths so resolution
 *                 cannot bypass a boundary.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    // ============================================================
    // ghost/domains — implementation imports: same domain, kernel, allowlist
    // ============================================================
    ...Object.entries(domainImplementationDebt).map(([domain, debt]) => ({
      name: `domain-dependencies-${domain}`,
      comment: `${domain} implementation may import only its own domain, the kernel, type-only imports, the library allowlist and its listed debt. Application dependencies are wired in domain.ts and injected.`,
      severity: 'error',
      from: {
        path: `^${domainsRoot}/${domain}/`,
        pathNot: domainImplementation.pathNot,
      },
      to: {
        pathNot: [
          ...serviceDependencyAllowlist,
          ...debt,
          '^ghost/core/kernel/',
          `^${domainsRoot}/${domain}/`,
          `^${domainsRoot}/[^/]+/index\\.ts$`,
        ],
        dependencyTypesNot: ['type-only', 'type-import'],
      },
    })),
    {
      name: 'domain-dependencies',
      comment:
        'Domain implementation may import only its own domain, the kernel, type-only imports and the explicit library allowlist. Application dependencies are wired in domain.ts and injected.',
      severity: 'error',
      from: {
        path: `^${domainsRoot}/(?!(?:${Object.keys(domainImplementationDebt).join('|')})/)([^/]+)/`,
        pathNot: domainImplementation.pathNot,
      },
      to: {
        pathNot: [
          ...serviceDependencyAllowlist,
          '^ghost/core/kernel/',
          `^${domainsRoot}/$1/`,
          // Another domain's public surface. Deep imports are caught by domains-cross-via-surface-only.
          `^${domainsRoot}/[^/]+/index\\.ts$`,
        ],
        dependencyTypesNot: ['type-only', 'type-import'],
      },
    },
    {
      name: 'domain-own-root',
      comment: 'Domain implementation must not retrieve dependencies from its own wiring root.',
      severity: 'error',
      from: domainImplementation,
      to: {
        path: `^${domainsRoot}/$1/domain\\.ts$`,
        dependencyTypesNot: ['type-only', 'type-import'],
      },
    },
    {
      name: 'domain-unresolved',
      comment: 'Resolve this runtime import so the domain dependency rule can be checked.',
      severity: 'error',
      from: domainImplementation,
      to: { couldNotResolve: true, dependencyTypesNot: ['type-only', 'type-import'] },
    },
    // ============================================================
    // ghost/domains — domain.ts may wire legacy code only from its allowlist
    // ============================================================
    ...Object.entries(domainLegacyAllowlist).map(([domain, allowed]) => ({
      name: `domain-wiring-${domain}`,
      comment: `${domain}/domain.ts may import legacy application code only from its allowlist in .dependency-cruiser.cjs.`,
      severity: 'error',
      from: { path: `^${domainsRoot}/${domain}/domain\\.ts$` },
      to: {
        path: '^ghost/core/',
        pathNot: ['^ghost/core/kernel/', ...allowed],
        dependencyTypesNot: ['type-only', 'type-import'],
      },
    })),
    {
      name: 'domain-wiring-unlisted',
      comment:
        'A domain without an entry in domainLegacyAllowlist may not import legacy application code from domain.ts. Add the domain and its allowlist.',
      severity: 'error',
      from: {
        path: `^${domainsRoot}/(?!(?:${Object.keys(domainLegacyAllowlist).join('|')})/)[^/]+/domain\\.ts$`,
      },
      to: {
        path: '^ghost/core/',
        pathNot: ['^ghost/core/kernel/'],
        dependencyTypesNot: ['type-only', 'type-import'],
      },
    },
    // ============================================================
    // ghost/domains — the rest of the application sees index.ts, domain.ts and the fragments only
    // ============================================================
    {
      name: 'domains-public-surface-only',
      comment:
        'Code outside ghost/domains may import a domain only through its index.ts (consumers), domain.ts (boot) or a fragment the central registries aggregate.',
      severity: 'error',
      from: { path: `^(?!${domainsRoot}/)` },
      to: {
        path: `^${domainsRoot}/[^/]+/`,
        pathNot: [`^${domainsRoot}/[^/]+/(index|domain|schema|permissions|settings)\\.ts$`],
      },
    },
    {
      name: 'domains-cross-via-surface-only',
      comment: "A domain may import a different domain only through that domain's index.ts.",
      severity: 'error',
      from: { path: `^${domainsRoot}/([^/]+)/` },
      to: {
        path: `^${domainsRoot}/(?!$1/)[^/]+/`,
        pathNot: [`^${domainsRoot}/[^/]+/index\\.ts$`],
      },
    },
    {
      name: 'service-dependencies',
      comment:
        'Wire application dependencies in the root index.ts and inject them into the implementation.',
      severity: 'error',
      from: serviceImplementations,
      to: {
        // $1 is the service name captured by from.path.
        pathNot: [...serviceDependencyAllowlist, `^${servicesRoot}/$1/`],
        dependencyTypesNot: ['type-only', 'type-import'],
      },
    },
    {
      name: 'service-own-root',
      comment: 'Service implementations must not retrieve dependencies from their own wiring root.',
      severity: 'error',
      from: serviceImplementations,
      to: {
        path: `^${servicesRoot}/$1/index\\.(js|ts)$`,
        dependencyTypesNot: ['type-only', 'type-import'],
      },
    },
    {
      name: 'service-unresolved',
      comment: 'Resolve this runtime import so the service dependency rule can be checked.',
      severity: 'error',
      from: serviceImplementations,
      to: { couldNotResolve: true, dependencyTypesNot: ['type-only', 'type-import'] },
    },
    // Kernel primitives must be independent of the application they support.
    {
      name: 'kernel-not-application',
      comment: 'Kernel code must not import application code, including shared.',
      severity: 'error',
      from: { path: '^ghost/core/kernel/' },
      to: { path: '^ghost/', pathNot: '^ghost/core/kernel/' },
    },
    // ============================================================
    // shared/ must not require server/* or frontend/*
    // ============================================================
    {
      name: 'shared-not-server-or-frontend',
      comment: 'Invalid require of core/server or core/frontend from core/shared.',
      severity: 'error',
      from: { path: '^ghost/core/shared/' },
      to: { path: '^ghost/core/(server|frontend)/' },
    },
    // ============================================================
    // Frontend must not require server/models directly
    // ============================================================
    {
      name: 'frontend-not-server-models',
      comment:
        'Invalid require of core/server/models from core/frontend. Fetch content through the public Content API (api.postsPublic / api.pagesPublic), injected via core/frontend/services/proxy — not the model layer directly. See #28420.',
      severity: 'error',
      from: { path: '^ghost/core/frontend/' },
      to: { path: '^ghost/core/server/models/' },
    },
    // ============================================================
    // Frontend must cross to server only via proxy (with allowlist)
    // ============================================================
    {
      name: 'frontend-to-server-via-proxy-only',
      comment:
        'Invalid require of core/server from core/frontend. Cross only via the proxy seam (core/frontend/services/proxy.js).',
      severity: 'error',
      from: {
        path: '^ghost/core/frontend/',
        // Adding files to this list is an anti-pattern
        // Goal: Work down until only proxy.js remains
        pathNot: [
          // The sanctioned seam.
          '^ghost/core/frontend/services/proxy\\.js$',

          // Composition root wiring (less wrong).
          '^ghost/core/frontend/web/site\\.js$',
          '^ghost/core/frontend/web/middleware/frontend-caching\\.js$',
          '^ghost/core/frontend/web/middleware/handle-image-sizes\\.js$',
          '^ghost/core/frontend/web/routers/link-redirects\\.js$',
          '^ghost/core/frontend/apps/private-blogging/lib/router\\.js$',
        ],
      },
      to: { path: '^ghost/core/server/' },
    },
    // ============================================================
    // Server must not require frontend (with allowlist)
    // ============================================================
    {
      name: 'server-not-frontend',
      comment:
        'Invalid require of core/frontend from core/server. The server must not depend on the frontend rendering layer.',
      severity: 'error',
      from: {
        path: '^ghost/core/server/',
        // Adding files to this list is an anti-pattern
        // Goal: Work down until the list is empty
        pathNot: [
          // Composition root: mounts the frontend Express app onto the server (less wrong).
          '^ghost/core/server/web/parent/frontend\\.js$',

          // Leak: route-settings reaches into the frontend routing config for QUERY/TAXONOMIES (fix first — config should be injected, see the in-file TODO).
          '^ghost/core/server/services/route-settings/validate\\.js$',
          '^ghost/core/server/services/route-settings/activation-bridge\\.ts$',
        ],
      },
      to: { path: '^ghost/core/frontend/' },
    },

    // ============================================================
    // Core loads sharp only through @tryghost/image-transform
    // ============================================================
    {
      name: 'core-sharp-via-image-transform',
      comment:
        'Invalid import of sharp from ghost. Use getSharp() from @tryghost/image-transform, which restricts the image decoders before anything is decoded.',
      severity: 'error',
      from: { path: '^ghost/core/' },
      to: { path: '(^|/)node_modules/sharp/', dependencyTypesNot: ['type-only'] },
    },

    // ============================================================
    // apps/ — shade/ is the foundation; must not depend on higher layers
    // ============================================================
    {
      name: 'shade-is-leaf',
      comment: 'shade/ must not depend on admin-x-framework. It is the foundation layer.',
      severity: 'error',
      from: { path: '^apps/shade/' },
      to: { path: '^@tryghost/admin-x-framework($|/)|^apps/admin-x-framework/' },
    },
    // ============================================================
    // apps/ — admin-x-framework/ must not depend on feature apps
    // ============================================================
    {
      name: 'framework-not-feature-apps',
      comment:
        'admin-x-framework/ must not depend on feature apps (activitypub). The framework layer sits below the feature layer.',
      severity: 'error',
      from: { path: '^apps/admin-x-framework/' },
      to: { path: '^@tryghost/activitypub($|/)|^apps/activitypub/' },
    },
    // ============================================================
    // apps/ — public UMD apps must not depend on admin-only libraries
    // ============================================================
    {
      name: 'public-apps-not-admin-libs',
      comment:
        'Public UMD apps (portal, comments-ui, etc.) must not depend on admin-only libraries (shade, admin-x-framework).',
      severity: 'error',
      from: {
        path: '^apps/(portal|comments-ui|signup-form|sodo-search|announcement-bar|admin-toolbar)/',
      },
      to: { path: '^@tryghost/(shade|admin-x-framework)($|/)|^apps/(shade|admin-x-framework)/' },
    },
    // ============================================================
    // apps/ — admin is an app, not a library
    // ============================================================
    {
      name: 'admin-is-app',
      comment:
        'No sibling app or library may depend on @tryghost/admin - whether by package specifier or by relative reach-in. Admin sits at the top of the layer stack.',
      severity: 'error',
      from: { path: '^apps/', pathNot: '^apps/admin/' },
      to: { path: '^@tryghost/admin($|/)|^apps/admin/' },
    },
    // ============================================================
    // apps/ — test data must not reach production source
    // ============================================================
    {
      name: 'no-test-data-in-production-source',
      comment:
        'App source must not import @tryghost/test-data. Only the ./selectors/* subpath is allowed, and only for testids — product copy is declared in the component that renders it. Tests, fixtures, and test utilities are exempt.',
      severity: 'error',
      from: {
        path: '^apps/[^/]+/src/',
        pathNot: ['\\.test\\.[^/]+$', '(^|/)__fixtures__/', '(^|/)__test-utils__/'],
      },
      to: {
        // The root entry resolves to the workspace source; the subpaths stay
        // unresolved specifiers. Both shapes are matched.
        path: '^(?:@tryghost/test-data($|/)|packages/testing/test-data/)',
        pathNot: ['^@tryghost/test-data/selectors/', '^packages/testing/test-data/src/selectors/'],
      },
    },
    // ============================================================
    // apps/admin — domains cross into each other only via api.ts
    // ============================================================
    {
      name: 'admin-domains-cross-via-api-only',
      comment:
        "A domain folder in apps/admin/src may import a different domain only through that domain's public surface (its api.ts). Deep imports couple domains to each other's internals. In-app imports use the @/ alias, which the cruiser sees as an unresolved @/-prefixed specifier; both that shape and resolved relative paths are matched. Test files are exempt.",
      severity: 'error',
      from: {
        path: '^apps/admin/src/(members|settings|analytics|posts|tags|comments|automations|onboarding|whats-new|editor)/',
        pathNot: ['\\.test\\.(ts|tsx)$'],
      },
      to: {
        path: '^(?:@/|apps/admin/src/)(?:members|settings|analytics|posts|tags|comments|automations|onboarding|whats-new|editor)($|/)',
        pathNot: [
          '^(?:@/|apps/admin/src/)$1($|/)',
          '^(?:@/|apps/admin/src/)(?:members|settings|analytics|posts|tags|comments|automations|onboarding|whats-new|editor)/api(\\.ts)?$',

          // Shared-shaped modules that still live inside a domain.
          // Goal: move them under src/shared and work this list down to empty.
          '^(?:@/|apps/admin/src/)settings/components/(?:koenig-loader|error-boundary)$',
          '^(?:@/|apps/admin/src/)posts/list/post-time$',
        ],
      },
    },
    // ============================================================
    // apps/admin — the shell and layout import domains only via api.ts
    // ============================================================
    {
      name: 'admin-shell-into-domains-via-api-only',
      comment:
        'The admin shell (top-level files in apps/admin/src plus its non-domain support folders) may import a domain only through its api.ts. Same matching notes as admin-domains-cross-via-api-only. Test files are exempt.',
      severity: 'error',
      from: {
        path: '^apps/admin/src/(?:(?:layout|hooks|providers|utils|schemas)/.+|[^/]+\\.(?:ts|tsx))$',
        pathNot: ['\\.test\\.(ts|tsx)$'],
      },
      to: {
        path: '^(?:@/|apps/admin/src/)(?:members|settings|analytics|posts|tags|comments|automations|onboarding|whats-new|editor)($|/)',
        pathNot: [
          '^(?:@/|apps/admin/src/)(?:members|settings|analytics|posts|tags|comments|automations|onboarding|whats-new|editor)/api(\\.ts)?$',
        ],
      },
    },
    // ============================================================
    // apps/admin — shared/ must stay domain-free
    // ============================================================
    {
      name: 'admin-shared-no-domains',
      comment:
        'apps/admin/src/shared must not import from feature domains. Move code used by a single domain into that domain; keep shared/ generic. In-app imports use the @/ alias, which the cruiser sees as an unresolved @/-prefixed specifier.',
      severity: 'error',
      from: { path: '^apps/admin/src/shared/' },
      to: {
        path: '^(@/|apps/admin/src/)(members|settings|analytics|posts|tags|comments|automations|onboarding|whats-new|editor|layout)($|/)',
      },
    },
  ],
  options: {
    // Resolve public package exports to authored workspace source when available.
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      importsFields: ['imports'],
      conditionNames: ['source', 'import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      err: { showExternalModulesUnresolved: true },
      markdown: { showExternalModulesUnresolved: true },
    },
    // Use the CLI's supported resolver hook to inspect authored TypeScript,
    // even when build:tsc has emitted adjacent JavaScript.
    webpackConfig: { fileName: './tools/scripts/lib/service-dependency-resolver.mjs' },
    // Keep incoming edges to built packages visible without scanning their output.
    doNotFollow: {
      path: auditServices
        ? `^(?!${servicesRoot}/)`
        : [
            'node_modules',
            '^(?!ghost/core/server/services/)(apps|ghost|packages|koenig)/.*/(build|built|dist)/',
          ],
    },
    // Skip our own tests and emitted companions. All source inside services stays visible:
    // a nested directory name must not hide a production dependency.
    exclude: {
      path: [
        '^(?!ghost/core/server/services/)(apps|ghost|packages)/.*/(coverage|coverage-next|test)/',
        ...sourceExclusions(__dirname),
      ],
    },
  },
};
