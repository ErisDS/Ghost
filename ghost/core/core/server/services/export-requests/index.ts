import { lazySingleton } from '../../../shared/lazy-singleton';
import { ExportRequestsService } from './export-requests-service';

let instance: ExportRequestsService | undefined;

export const service = lazySingleton<ExportRequestsService>('ExportRequestsService', () => instance);

export function init(): void {
  instance ??= new ExportRequestsService();
}
