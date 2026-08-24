import { DrawSyncController } from './polling.js';

export function initializeApp(): DrawSyncController | null {
  const root = document.getElementById('app');
  if (!root) return null;
  const liveRegion = document.getElementById('live-announcer');
  const controller = new DrawSyncController(root, liveRegion);
  controller.start();
  return controller;
}

if (typeof document !== 'undefined') {
  initializeApp();
}
