#!/usr/bin/env node
// Shape check for ghost/domains. Version zero: every domain has index.ts,
// module.ts and CONTEXT.md, module.ts default-exports a defineModule call whose
// name matches the directory, nothing unexpected sits at the domain root, and
// ghost/package.json "imports" plus tsconfig "paths" list exactly the domain's
// importable files (index, module, fragments) so a deep import fails to resolve.
// Dependency rules live in .dependency-cruiser.cjs, not here.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const domainsRoot = path.join(root, 'ghost/domains');
const REQUIRED = ['index.ts', 'module.ts', 'CONTEXT.md'];
const FRAGMENTS = ['settings.ts', 'permissions.ts', 'schema.ts'];
const OPTIONAL_FILES = ['README.md', ...FRAGMENTS];
const TEST_FILE = /\.test\.(js|ts)$/;

function readJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

// The names a domain may be imported by, and the file each resolves to.
function expectedSpecifiers(name, domain) {
  const entries = { [`#domains/${name}`]: 'index.ts', [`#domains/${name}/module`]: 'module.ts' };
  for (const fragment of FRAGMENTS) {
    if (existsSync(path.join(domain, fragment))) {
      entries[`#domains/${name}/${fragment.replace(/\.ts$/, '')}`] = fragment;
    }
  }
  return entries;
}

export function checkDomains(dir = domainsRoot) {
  const problems = [];
  if (!existsSync(dir)) {
    return problems;
  }
  const ghostRoot = path.resolve(dir, '..');
  const imports = readJson(path.join(ghostRoot, 'package.json')).imports ?? {};
  const tsconfigText = readFileSync(path.join(ghostRoot, 'tsconfig.json'), 'utf8');
  const paths = Object.fromEntries(
    [...tsconfigText.matchAll(/"(#domains\/[^"]+)":\s*\["([^"]+)"\]/g)].map((m) => [m[1], m[2]]),
  );
  const seen = new Set();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (entry.name !== 'README.md') {
        problems.push(`${entry.name}: only README.md and domain directories belong at ghost/domains`);
      }
      continue;
    }
    const name = entry.name;
    const domain = path.join(dir, name);
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      problems.push(`${name}: domain directories are lower-case and hyphenated`);
    }
    for (const file of REQUIRED) {
      if (!existsSync(path.join(domain, file))) {
        problems.push(`${name}: missing ${file}`);
      }
    }
    for (const item of readdirSync(domain)) {
      const isDir = statSync(path.join(domain, item)).isDirectory();
      if (isDir || REQUIRED.includes(item) || OPTIONAL_FILES.includes(item) || TEST_FILE.test(item)) {
        continue;
      }
      problems.push(`${name}: unexpected file at the domain root: ${item}`);
    }
    for (const [specifier, file] of Object.entries(expectedSpecifiers(name, domain))) {
      seen.add(specifier);
      const relative = `./domains/${name}/${file}`;
      const entry = imports[specifier];
      if (!entry || entry.source !== relative || entry.default !== relative.replace(/\.ts$/, '.js')) {
        problems.push(`${name}: package.json "imports" must map ${specifier} to ${relative} (source) and its .js (default)`);
      }
      if (paths[specifier] !== relative) {
        problems.push(`${name}: tsconfig.json "paths" must map ${specifier} to ${relative}`);
      }
    }
    const wiring = path.join(domain, 'module.ts');
    if (existsSync(wiring)) {
      const source = readFileSync(wiring, 'utf8');
      const match = source.match(/export default defineModule(?:<[^>]*>)?\(\{\s*name:\s*'([^']+)'/);
      if (!match) {
        problems.push(`${name}: module.ts must default-export defineModule({ name: '${name}', ... })`);
      } else if (match[1] !== name) {
        problems.push(`${name}: module.ts declares module name '${match[1]}'`);
      }
    }
  }
  for (const specifier of [...Object.keys(imports), ...Object.keys(paths)]) {
    if (specifier.startsWith('#domains/') && !seen.has(specifier)) {
      problems.push(`${specifier}: not a domain surface, module file or fragment; remove it from package.json imports / tsconfig paths`);
    }
  }
  return problems;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const problems = checkDomains();
  for (const problem of problems) {
    console.error(`domains: ${problem}`);
  }
  if (problems.length > 0) {
    process.exit(1);
  }
  console.log(`domains: ${readdirSync(domainsRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).length} domain(s) conform`);
}
