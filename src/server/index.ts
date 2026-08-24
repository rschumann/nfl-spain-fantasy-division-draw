export function getServerStatus(): string {
  return 'ready';
}

console.info(`Server initialized with status: ${getServerStatus()}`);
