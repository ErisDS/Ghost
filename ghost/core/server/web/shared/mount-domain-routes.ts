import { IncorrectUsageError } from '@tryghost/errors';

/** One route a domain contributes. Names are resolved by the mounting app. */
export interface DomainRoute {
  method: 'get' | 'post' | 'put' | 'delete';
  path: string;
  /** Middleware names, resolved against the map the mounting app passes. */
  middleware: string[];
  /** [api-framework endpoint name, controller method], as registered in api/endpoints. */
  endpoint: [string, string];
}

type Handler = (...args: unknown[]) => unknown;
type Middleware = Handler | Handler[];

interface Mountable {
  get(path: string, ...handlers: Middleware[]): unknown;
  post(path: string, ...handlers: Middleware[]): unknown;
  put(path: string, ...handlers: Middleware[]): unknown;
  delete(path: string, ...handlers: Middleware[]): unknown;
}

interface MountOptions {
  api: Record<string, Record<string, unknown>>;
  http: (endpoint: unknown) => Handler;
  middleware: Record<string, Middleware>;
}

/**
 * Mounts a domain's declared routes on an Express app or router. This is the
 * seam between the HTTP boundary (auth, body parsing, the api-framework
 * pipeline) and a domain that only knows its paths and its controller methods.
 */
export function mountDomainRoutes(
  app: Mountable,
  routes: DomainRoute[],
  { api, http, middleware }: MountOptions,
): void {
  for (const route of routes) {
    const handlers = route.middleware.map((name) => {
      const handler = middleware[name];
      if (!handler) {
        throw new IncorrectUsageError({
          message: `Unknown middleware "${name}" for domain route ${route.method.toUpperCase()} ${route.path}.`,
        });
      }
      return handler;
    });
    const [name, method] = route.endpoint;
    const endpoint = api[name]?.[method];
    if (!endpoint) {
      throw new IncorrectUsageError({
        message: `Unknown endpoint "${name}.${method}" for domain route ${route.method.toUpperCase()} ${route.path}.`,
      });
    }
    app[route.method](route.path, ...handlers, http(endpoint));
  }
}
