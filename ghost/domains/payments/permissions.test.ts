import assert from 'node:assert/strict';
import fixtures from '../../core/server/data/schema/fixtures/fixtures.json';
import { permissions, roles } from './permissions';

type Fixture = { entries: Array<Record<string, unknown>> } | { relations: unknown };

function permissionEntries(): Array<{ name: string; action_type: string; object_type: string }> {
  const model = (fixtures.models as Array<{ name: string; entries: unknown[] }>).find(
    (item) => item.name === 'Permission',
  );
  assert.ok(model, 'fixtures.json declares Permission entries');
  return model.entries as Array<{ name: string; action_type: string; object_type: string }>;
}

describe('payments permissions fragment', function () {
  it('matches the committed fixtures for every object type it owns', function () {
    const owned = new Set(permissions.map((entry) => entry.object_type));
    const committed = permissionEntries().filter((entry) => owned.has(entry.object_type));
    assert.deepEqual(committed, permissions);
  });

  it('matches the committed role grants', function () {
    const relation = (fixtures.relations as Array<{ from: { model: string }; entries: Record<string, Record<string, unknown>> }>).find(
      (item) => item.from.model === 'Role',
    );
    assert.ok(relation, 'fixtures.json declares Role relations');
    for (const [role, grants] of Object.entries(roles)) {
      for (const [objectType, actions] of Object.entries(grants)) {
        assert.deepEqual(relation.entries[role][objectType], actions);
      }
    }
  });
});
