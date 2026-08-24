import { DrawSyncController } from './polling.js';
import { ChatController } from './chat/chat-controller.js';
import { AdminController } from './admin-controller.js';

function setupAdmin(root: HTMLElement): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const adminKey = params.get('adminKey') || localStorage.getItem('adminKey');
  if (adminKey) {
    localStorage.setItem('adminKey', adminKey);
    const header = root.querySelector<HTMLElement>('.app-header');
    if (header) {
      const admin = new AdminController(adminKey);
      void admin.init(header);
    }
  }
}

export function initializeApp(): {
  draw: DrawSyncController;
  chat: ChatController | null;
} | null {
  const root = document.getElementById('app');
  if (!root) return null;
  const liveRegion = document.getElementById('live-announcer');
  const drawController = new DrawSyncController(root, liveRegion);
  drawController.start();

  const chatRoot = document.getElementById('chat-root');
  const chatToggle = document.getElementById('chat-toggle-btn');
  let chatController: ChatController | null = null;

  if (chatRoot) {
    chatController = new ChatController(chatRoot, chatToggle);
    chatController.start();
  }

  setupAdmin(root);

  return { draw: drawController, chat: chatController };
}

if (typeof document !== 'undefined') {
  initializeApp();
}
