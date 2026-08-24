import 'dotenv/config';
import { bootstrap } from './bootstrap.js';

async function main(): Promise<void> {
  try {
    const server = await bootstrap();
    const address = await server.start();
    console.info(`NFL Spain Draw server running at ${address}`);
  } catch (err) {
    console.error(
      'Fatal bootstrap failure:',
      err instanceof Error ? err.message : String(err)
    );
    process.exit(1);
  }
}

if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  main();
}
