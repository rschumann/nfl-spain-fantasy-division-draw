import { resolve, relative, isAbsolute } from 'node:path';

export function isPathInsidePublicRoots(
  statePath: string,
  projectRoot = process.cwd()
): boolean {
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
