import type { DomainRoute } from '../../../../core/server/web/shared/mount-domain-routes';

/**
 * The domain's routes, declared as data. The HTTP boundary mounts them with
 * mountDomainRoutes(), resolving middleware names and api-framework endpoints
 * on its side, so the domain never imports Express, auth or the API registry.
 */
export const adminRoutes: DomainRoute[] = [
  {
    method: 'put',
    path: '/gifts/flush_reminders',
    middleware: ['authAdminApiWithUrl'],
    endpoint: ['gifts', 'flushReminders'],
  },
  {
    method: 'put',
    path: '/gifts/flush_deliveries',
    middleware: ['authAdminApiWithUrl'],
    endpoint: ['gifts', 'flushDeliveries'],
  },
];

export const membersRoutes: DomainRoute[] = [
  {
    method: 'get',
    path: '/api/gifts/:token/redeem',
    middleware: ['loadMemberSession'],
    endpoint: ['giftsMembers', 'getRedeemable'],
  },
  {
    method: 'post',
    path: '/api/gifts/:token/redeem',
    middleware: ['json', 'loadMemberSession'],
    endpoint: ['giftsMembers', 'redeem'],
  },
];
