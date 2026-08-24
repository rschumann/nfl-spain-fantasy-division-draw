// Web application entry point
export function initializeApp(): void {
  const root = document.getElementById('app');
  if (root) {
    root.textContent = 'NFL Spain';
  }
}

if (typeof document !== 'undefined') {
  initializeApp();
}
