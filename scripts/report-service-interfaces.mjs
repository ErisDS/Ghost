#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const repoRoot = path.resolve(import.meta.dirname, '..');
const servicesRoot = path.join(repoRoot, 'ghost/core/core/server/services');

const entryFiles = fs
  .readdirSync(servicesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const directory = path.join(servicesRoot, entry.name);
    return ['index.ts', 'index.js']
      .map((file) => path.join(directory, file))
      .find((file) => fs.existsSync(file));
  })
  .filter(Boolean)
  .filter((file) => fs.readFileSync(file, 'utf8').includes('lazySingleton'));

const program = ts.createProgram(entryFiles, {
  allowJs: true,
  checkJs: true,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.Node10,
  noEmit: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
});
const checker = program.getTypeChecker();
const requireFromGhostCore = createRequire(path.join(repoRoot, 'ghost/core/package.json'));

function getSourceFile(file) {
  const absoluteFile = path.resolve(file);
  return program
    .getSourceFiles()
    .find((sourceFile) => path.resolve(sourceFile.fileName) === absoluteFile);
}

function visit(node, predicate, matches = []) {
  if (predicate(node)) {
    matches.push(node);
  }
  ts.forEachChild(node, (child) => {
    visit(child, predicate, matches);
  });
  return matches;
}

function directReturns(functionNode) {
  const returns = [];
  function walk(node) {
    if (node !== functionNode && ts.isFunctionLike(node)) {
      return;
    }
    if (ts.isReturnStatement(node)) {
      returns.push(node);
      return;
    }
    ts.forEachChild(node, walk);
  }
  walk(functionNode);
  return returns;
}

function isPublicMethod(symbol, location, declaredMethodsOnly = true) {
  if (symbol.name.startsWith('#') || symbol.name === 'constructor') {
    return false;
  }
  const declaration = symbol.valueDeclaration || symbol.declarations?.[0];
  if (
    declaration?.modifiers?.some(
      (modifier) =>
        modifier.kind === ts.SyntaxKind.PrivateKeyword ||
        modifier.kind === ts.SyntaxKind.ProtectedKeyword,
    )
  ) {
    return false;
  }
  // Constructor-injected callbacks are callable properties, but they are not
  // methods offered by the service. Restrict class-like types to declared
  // methods; object-literal facades are handled separately below.
  return (
    (!declaredMethodsOnly ||
      ts.isMethodDeclaration(declaration) ||
      ts.isMethodSignature(declaration)) &&
    checker.getTypeOfSymbolAtLocation(symbol, declaration || location).getCallSignatures().length >
      0
  );
}

function methodsFromType(type, location, declaredMethodsOnly = true) {
  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return [];
  }
  return checker
    .getPropertiesOfType(type)
    .filter((symbol) => !symbol.name.startsWith('__@'))
    .filter((symbol) => isPublicMethod(symbol, location, declaredMethodsOnly))
    .map((symbol) => symbol.name);
}

function facadesFromType(type, location) {
  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return [];
  }
  return checker
    .getPropertiesOfType(type)
    .filter((symbol) => {
      const declaration = symbol.valueDeclaration || symbol.declarations?.[0];
      const propertyType = checker.getTypeOfSymbolAtLocation(symbol, declaration || location);
      const declaredOnObjectLiteral =
        declaration &&
        (ts.isPropertyAssignment(declaration) ||
          ts.isShorthandPropertyAssignment(declaration) ||
          ts.isGetAccessorDeclaration(declaration)) &&
        ts.isObjectLiteralExpression(declaration.parent);
      const objectLiteralGetter =
        declaration &&
        ts.isGetAccessorDeclaration(declaration) &&
        ts.isObjectLiteralExpression(declaration.parent);
      return (
        declaredOnObjectLiteral &&
        (objectLiteralGetter ||
          (propertyType.getCallSignatures().length === 0 &&
            (propertyType.flags & ts.TypeFlags.Object) !== 0))
      );
    })
    .map((symbol) => symbol.name);
}

function facadeMethodsFromType(type, location) {
  if (type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return [];
  }
  return checker.getPropertiesOfType(type).flatMap((symbol) => {
    const declaration = symbol.valueDeclaration || symbol.declarations?.[0];
    if (
      !declaration ||
      !ts.isBinaryExpression(declaration) ||
      !ts.isPropertyAccessExpression(declaration.left) ||
      declaration.left.expression.kind !== ts.SyntaxKind.ThisKeyword ||
      symbol.name.startsWith('_') ||
      symbol.name.startsWith('#')
    ) {
      return [];
    }
    const sourceFile = declaration.getSourceFile();
    const value = ts.isIdentifier(declaration.right)
      ? findLatestValue(sourceFile, declaration.right.text)
      : declaration.right;
    if (!value || !ts.isNewExpression(value)) {
      return [];
    }
    const valueClass = classForNewExpression(sourceFile, value);
    const methods = methodsFromType(checker.getTypeAtLocation(value), value);
    return (methods.length ? methods : valueClass ? methodsFromClass(valueClass) : []).map(
      (method) => `${symbol.name}.${method}`,
    );
  });
}

function methodsFromClass(classNode) {
  return classNode.members
    .filter((member) => ts.isMethodDeclaration(member) || ts.isMethodSignature(member))
    .filter(
      (member) =>
        !member.modifiers?.some(
          (modifier) =>
            modifier.kind === ts.SyntaxKind.PrivateKeyword ||
            modifier.kind === ts.SyntaxKind.ProtectedKeyword,
        ),
    )
    .map((member) => member.name?.getText().replace(/^['"]|['"]$/g, ''))
    .filter((name) => name && name !== 'constructor' && !name.startsWith('#'));
}

function getJobManagerMethods() {
  const entry = requireFromGhostCore.resolve('@tryghost/job-manager');
  const entrySource = fs.readFileSync(entry, 'utf8');
  const targetMatch = entrySource.match(/require\(['"](\.\/[^'"]+)['"]\)/);
  if (!targetMatch) {
    return [];
  }
  const target = requireFromGhostCore.resolve(path.resolve(path.dirname(entry), targetMatch[1]));
  const sourceFile = ts.createSourceFile(
    target,
    fs.readFileSync(target, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const classNode = visit(sourceFile, ts.isClassDeclaration)[0];
  return classNode ? [...methodsFromClass(classNode), 'initTestMode'] : [];
}

function classForNewExpression(sourceFile, expression) {
  const className = expression.expression.getText();
  const localClass = visit(
    sourceFile,
    (node) => ts.isClassDeclaration(node) && node.name?.text === className,
  )[0];
  if (localClass) {
    return localClass;
  }

  const declaration = visit(
    sourceFile,
    (node) =>
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === className &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText() === 'require',
  )[0];
  const specifier = declaration?.initializer?.arguments?.[0];
  if (!specifier || !ts.isStringLiteral(specifier)) {
    return undefined;
  }

  const base = path.resolve(path.dirname(sourceFile.fileName), specifier.text);
  const target = [
    base,
    `${base}.ts`,
    `${base}.js`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.js'),
  ].find((file) => fs.existsSync(file));
  if (!target) {
    return undefined;
  }
  const targetSource = getSourceFile(target);
  return targetSource && visit(targetSource, (node) => ts.isClassDeclaration(node))[0];
}

function publicFacadeMethodsAssignedToThis(classNode) {
  const classSource = classNode.getSourceFile();
  return visit(
    classNode,
    (node) =>
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      node.left.expression.kind === ts.SyntaxKind.ThisKeyword &&
      !node.left.name.text.startsWith('_') &&
      !node.left.name.text.startsWith('#'),
  ).flatMap((node) => {
    const name = node.left.name.text;
    const value = ts.isIdentifier(node.right)
      ? findLatestValue(classSource, node.right.text)
      : node.right;
    if (!value || !ts.isNewExpression(value)) {
      return [];
    }
    const valueClass = classForNewExpression(classSource, value);
    const methods = methodsFromType(checker.getTypeAtLocation(value), value);
    return (methods.length ? methods : valueClass ? methodsFromClass(valueClass) : []).map(
      (method) => `${name}.${method}`,
    );
  });
}

function requiredSourceForIdentifier(sourceFile, identifier) {
  const declaration = visit(sourceFile, (node) => {
    if (
      !ts.isVariableDeclaration(node) ||
      !node.initializer ||
      !ts.isCallExpression(node.initializer) ||
      node.initializer.expression.getText() !== 'require'
    ) {
      return false;
    }
    return (
      (ts.isIdentifier(node.name) && node.name.text === identifier) ||
      (ts.isObjectBindingPattern(node.name) &&
        node.name.elements.some((element) => element.name.getText() === identifier))
    );
  })[0];
  const specifier = declaration?.initializer?.arguments?.[0];
  if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith('.')) {
    return undefined;
  }
  const base = path.resolve(path.dirname(sourceFile.fileName), specifier.text);
  const target = [
    base,
    `${base}.ts`,
    `${base}.js`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.js'),
  ].find((file) => fs.existsSync(file));
  return target && getSourceFile(target);
}

function describeExpression(sourceFile, expression, prefix = '') {
  if (ts.isParenthesizedExpression(expression)) {
    return describeExpression(sourceFile, expression.expression, prefix);
  }
  if (ts.isAsExpression(expression) || ts.isTypeAssertionExpression(expression)) {
    return describeExpression(sourceFile, expression.expression, prefix);
  }
  if (ts.isNewExpression(expression)) {
    const methods = methodsFromType(checker.getTypeAtLocation(expression), expression);
    const fallbackClass = classForNewExpression(sourceFile, expression);
    const ownMethods = (
      methods.length ? methods : fallbackClass ? methodsFromClass(fallbackClass) : []
    ).map((method) => `${prefix}${method}`);
    const facadeMethods = fallbackClass
      ? publicFacadeMethodsAssignedToThis(fallbackClass).map((method) => `${prefix}${method}`)
      : [];
    return [...ownMethods, ...facadeMethods];
  }
  if (ts.isObjectLiteralExpression(expression)) {
    return expression.properties.flatMap((property) => {
      if (
        !ts.isPropertyAssignment(property) &&
        !ts.isShorthandPropertyAssignment(property) &&
        !ts.isMethodDeclaration(property)
      ) {
        return [];
      }
      const name = property.name?.getText().replace(/^['"]|['"]$/g, '');
      if (!name) {
        return [];
      }
      if (ts.isMethodDeclaration(property)) {
        return [`${prefix}${name}`];
      }
      const value = ts.isShorthandPropertyAssignment(property)
        ? property.name
        : property.initializer;
      if (!value) {
        return [];
      }
      const referencesFunction =
        ts.isIdentifier(value) &&
        visit(
          sourceFile,
          (node) => ts.isFunctionDeclaration(node) && node.name?.text === value.text,
        ).length > 0;
      if (referencesFunction || checker.getTypeAtLocation(value).getCallSignatures().length) {
        return [`${prefix}${name}`];
      }
      return describeExpression(sourceFile, value, `${prefix}${name}.`);
    });
  }
  if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)) {
    const targetSource = requiredSourceForIdentifier(sourceFile, expression.expression.text);
    const factory =
      targetSource &&
      visit(
        targetSource,
        (node) => ts.isFunctionDeclaration(node) && node.name?.text === expression.expression.text,
      )[0];
    if (factory) {
      return directReturns(factory)
        .filter((statement) => statement.expression)
        .flatMap((statement) => describeExpression(targetSource, statement.expression, prefix));
    }
  }
  if (ts.isCallExpression(expression) && expression.expression.getText() === 'Object.assign') {
    return expression.arguments.flatMap((argument) =>
      describeExpression(sourceFile, argument, prefix),
    );
  }
  if (ts.isIdentifier(expression)) {
    const value = findLatestValue(sourceFile, expression.text, expression.pos);
    if (value && value !== expression) {
      return describeExpression(sourceFile, value, prefix);
    }
  }

  return methodsFromType(checker.getTypeAtLocation(expression), expression, false).map(
    (method) => `${prefix}${method}`,
  );
}

function assignedProperties(sourceFile, objectName) {
  return visit(
    sourceFile,
    (node) =>
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      ts.isIdentifier(node.left.expression) &&
      node.left.expression.text === objectName,
  ).flatMap((node) => {
    const name = node.left.name.text;
    if (checker.getTypeAtLocation(node.right).getCallSignatures().length) {
      return [name];
    }
    return describeExpression(sourceFile, node.right, `${name}.`);
  });
}

function findLatestValue(sourceFile, variableName) {
  const values = visit(sourceFile, (node) => {
    return (
      (ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === variableName &&
        node.initializer) ||
      (ts.isBinaryExpression(node) &&
        node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isIdentifier(node.left) &&
        node.left.text === variableName)
    );
  }).map((node) => (ts.isVariableDeclaration(node) ? node.initializer : node.right));
  return values.at(-1);
}

function getServiceTarget(sourceFile) {
  const declaration = visit(
    sourceFile,
    (node) =>
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'service' &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText().endsWith('lazySingleton'),
  )[0];
  const getter = declaration?.initializer?.arguments?.[1];
  if (!getter || (!ts.isArrowFunction(getter) && !ts.isFunctionExpression(getter))) {
    return undefined;
  }
  return ts.isBlock(getter.body)
    ? visit(getter.body, ts.isReturnStatement)[0]?.expression
    : getter.body;
}

const inventory = entryFiles
  .map((file) => {
    const sourceFile = getSourceFile(file);
    const target = sourceFile && getServiceTarget(sourceFile);
    let methods = target ? describeExpression(sourceFile, target) : [];

    // An untyped `let instance` is common in legacy JS. Its assignments carry
    // more useful information than the variable's inferred `any` type.
    if (!methods.length && target && ts.isIdentifier(target)) {
      methods = visit(
        sourceFile,
        (node) =>
          ts.isBinaryExpression(node) &&
          node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
          ts.isIdentifier(node.left) &&
          node.left.text === target.text,
      ).flatMap((node) => describeExpression(sourceFile, node.right));
    }
    if (target && ts.isIdentifier(target)) {
      methods.push(...assignedProperties(sourceFile, target.text));
    }
    if (target) {
      methods.push(...facadeMethodsFromType(checker.getTypeAtLocation(target), target));
    }

    const serviceName = path.basename(path.dirname(file));
    if ((serviceName === 'jobs' || serviceName === 'mentions-jobs') && !methods.length) {
      methods = getJobManagerMethods();
    }

    const facades = new Set(
      methods
        .filter((methodPath) => methodPath.includes('.'))
        .map((methodPath) => methodPath.split('.')[0]),
    );
    if (target) {
      facadesFromType(checker.getTypeAtLocation(target), target).forEach((facade) =>
        facades.add(facade),
      );
    }

    return {
      service: serviceName,
      methods: [...new Set(methods)].sort(),
      facades: [...facades].sort(),
    };
  })
  .sort((a, b) => a.service.localeCompare(b.service));

const counts = new Map();
const facadeCounts = new Map();
for (const { service, methods, facades } of inventory) {
  const methodNames = new Set(methods.map((methodPath) => methodPath.split('.').at(-1)));
  for (const method of methodNames) {
    const entry = counts.get(method) || { count: 0, services: [] };
    entry.count += 1;
    entry.services.push(service);
    counts.set(method, entry);
  }

  for (const facade of facades) {
    const facadeMethods = methods
      .filter((methodPath) => methodPath.startsWith(`${facade}.`))
      .map((methodPath) => methodPath.slice(facade.length + 1));
    const entry = facadeCounts.get(facade) || { services: [], methods: new Set() };
    entry.services.push(service);
    facadeMethods.forEach((method) => entry.methods.add(method));
    facadeCounts.set(facade, entry);
  }
}

const lines = [];
const print = (line = '') => lines.push(line);

print('# Service interface inventory\n');
print(
  'Generated by `node scripts/report-service-interfaces.mjs`. Nested names show methods exposed through a named facade property. A dash means the facade exposes state rather than a statically discoverable method.\n',
);
print('| Service | Facades | Exposed methods |');
print('| --- | --- | --- |');
for (const { service, methods, facades } of inventory) {
  print(
    `| \`${service}\` | ${facades.length ? facades.map((facade) => `\`${facade}\``).join(', ') : '—'} | ${methods.length ? methods.map((method) => `\`${method}\``).join(', ') : '—'} |`,
  );
}

print('\n## Facade frequency\n');
print(
  'A facade is a top-level named object reached through `service`, such as `service.api` or `service.controller`.\n',
);
print('| Facade | Service count | Services | Methods exposed beneath facade |');
print('| --- | ---: | --- | --- |');
for (const [facade, { services, methods }] of [...facadeCounts].sort(
  ([aName, a], [bName, b]) => b.services.length - a.services.length || aName.localeCompare(bName),
)) {
  print(
    `| \`${facade}\` | ${services.length} | ${services.map((service) => `\`${service}\``).join(', ')} | ${[
      ...methods,
    ]
      .sort()
      .map((method) => `\`${method}\``)
      .join(', ')} |`,
  );
}

print('\n## Method-name frequency\n');
print('| Method | Service count | Services |');
print('| --- | ---: | --- |');
for (const [method, { count, services }] of [...counts].sort(
  ([aName, a], [bName, b]) => b.count - a.count || aName.localeCompare(bName),
)) {
  print(`| \`${method}\` | ${count} | ${services.map((service) => `\`${service}\``).join(', ')} |`);
}

const output = `${lines.join('\n')}\n`;
const outputArg = process.argv.indexOf('--output');
if (outputArg !== -1) {
  const outputFile = process.argv[outputArg + 1];
  if (!outputFile) {
    throw new Error('--output requires a file path');
  }
  fs.writeFileSync(path.resolve(outputFile), output);
} else {
  process.stdout.write(output);
}
