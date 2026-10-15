import type { GiftController } from '../gift-controller';

export function createGiftsMembersController(deps: {
  getController: () => GiftController;
}): Record<string, unknown>;
