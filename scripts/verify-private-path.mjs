import { resolve, relative, isAbsolute } from 'node:path';

export function isPathInsidePublicRoots(statePath, projectRoot = process.cwd()) {
  const absoluteStatePath = isAbsolute(statePath)
    ? resolve(statePath)
    : resolve(projectRoot, statePath);

  const forbiddenRoots = [
    resolve(projectRoot, 'src/web'),
    resolve(projectRoot, 'public'),
    resolve(projectRoot, 'dist')
  ];

  return forbiddenRoots.some((forbidden) => {
    const rel = relative(forbidden, absoluteStatePath);
    return !rel.startsWith('..') && !isAbsolute(rel);
  });
}

function runCheck() {
  const statePath = process.env.DRAW_STATE_PATH || '.data/draw-state.json';
  if (isPathInsidePublicRoots(statePath)) {
    console.error(`ERROR: DRAW_STATE_PATH (${statePath}) is inside public assets!`);
    process.exit(1);
  }
  console.info('Private path check passed: state path is outside public assets.');
}

if (process.argv[1]?.endsWith('verify-private-path.mjs')) {
  runCheck();
}
