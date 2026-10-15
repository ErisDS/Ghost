/**
 * Permissions the payments domain contributes. core/server/data/schema/fixtures/
 * fixtures.json is still the file boot loads (config points at it by path), so
 * this fragment is checked against it by permissions.test.ts rather than
 * composed into it. Composing it needs the fixture loader to take an object.
 */
export const permissions = [
  { name: 'Flush gift reminders', action_type: 'flushReminders', object_type: 'gift' },
  { name: 'Flush gift deliveries', action_type: 'flushDeliveries', object_type: 'gift' },
] as const;

/** Role to permitted actions, keyed by object type. */
export const roles = {
  'Scheduler Integration': { gift: ['flushReminders', 'flushDeliveries'] },
} as const;
