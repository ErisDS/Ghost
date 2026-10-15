#!/usr/bin/env node
// Shape check for ghost/domains. Version zero: every domain has domain.ts,
// api.ts and CONTEXT.md, domain.ts default-exports a defineModule call whose
// name matches the directory, and nothing unexpected sits at the domain root.
// Dependency rules live in .dependency-cruiser.cjs, not here.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const domainsRoot = path.join(root, 'ghost/domains');
const REQUIRED = ['domain.ts', 'api.ts', 'CONTEXT.md'];
const OPTIONAL_FILES = ['README.md', 'settings.ts', 'permissions.ts', 'schema.ts'];
const TEST_FILE = /\.test\.(js|ts)$/;

export function checkDomains(dir = domainsRoot) {
  const problems = [];
  if (!existsSync(dir)) {
    return problems;
  }
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
    const wiring = path.join(domain, 'domain.ts');
    if (existsSync(wiring)) {
      const source = readFileSync(wiring, 'utf8');
      const match = source.match(/export default defineModule\(\{\s*name:\s*'([^']+)'/);
      if (!match) {
        problems.push(`${name}: domain.ts must default-export defineModule({ name: '${name}', ... })`);
      } else if (match[1] !== name) {
        problems.push(`${name}: domain.ts declares module name '${match[1]}'`);
      }
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
