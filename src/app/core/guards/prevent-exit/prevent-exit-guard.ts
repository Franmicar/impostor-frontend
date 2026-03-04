import { CanDeactivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm/confirm.service';
import { GameEngineService } from '../../services/game-engine/game-engine';

export interface CanComponentDeactivate {
  canDeactivate: () => boolean | Promise<boolean>;
}

export const preventExitGuard: CanDeactivateFn<CanComponentDeactivate> = async (component, currentRoute, currentState, nextState) => {
  const router = inject(Router);
  const engine = inject(GameEngineService);

  // Check if navigation is marked as intentional
  // Our game buttons will now use { state: { intentional: true } }
  const navigationState = router.currentNavigation()?.extras.state as { intentional?: boolean } | undefined;
  const isIntentional = navigationState?.intentional === true;

  if (isIntentional) {
    return true;
  }

  // Otherwise, user is trying to use the back button, or editing the URL which might trigger guards.
  const confirmService = inject(ConfirmService);
  const confirmed = await confirmService.requestConfirmation('');

  if (confirmed) {
    engine.resetGame();
    return router.parseUrl('/setup');
  }

  return false;
};
