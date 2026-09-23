import { AutomationsService } from './service';
import type { AutomationsServiceOptions } from './service';
import { lazySingleton } from '../../../shared/lazy-singleton';

let instance: AutomationsService | undefined;
export const service = lazySingleton<AutomationsService>('AutomationsService', () => instance);
export const automationsService = service;

export function init(options: AutomationsServiceOptions): void {
  instance ??= new AutomationsService();
  instance.init(options);
}
