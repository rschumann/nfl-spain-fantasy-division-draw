import { DrawSyncController } from './polling.js';
import { ChatController } from './chat/chat-controller.js';

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

  return { draw: drawController, chat: chatController };
}

if (typeof document !== 'undefined') {
  initializeApp();
}
