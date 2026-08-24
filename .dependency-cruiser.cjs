/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are forbidden.',
      from: {},
      to: { circular: true }
    },
    {
      name: 'domain-no-infra',
      severity: 'error',
      comment: 'Domain must not depend on application, adapters, server, or web.',
      from: { path: '^src/domain' },
      to: { path: '^src/(application|adapters|server|web)' }
    },
    {
      name: 'domain-no-core',
      severity: 'error',
      comment: 'Domain must not depend on Node core modules.',
      from: { path: '^src/domain' },
      to: { dependencyTypes: ['core'] }
    },
    {
      name: 'domain-no-npm',
      severity: 'error',
      comment: 'Domain must not depend on external npm packages.',
      from: { path: '^src/domain' },
      to: { dependencyTypes: ['npm', 'npm-dev'] }
    },
    {
      name: 'application-purity',
      severity: 'error',
      comment: 'Application must not depend on adapters, server, or web.',
      from: { path: '^src/application' },
      to: { path: '^src/(adapters|server|web)' }
    },
    {
      name: 'web-chat-isolation',
      severity: 'error',
      comment: 'Web chat must not depend on draw domain or application.',
      from: { path: '^src/web/chat' },
      to: { path: '^src/(domain|application)' }
    },
    {
      name: 'no-generic-helpers',
      severity: 'error',
      comment: 'Generic utils, helpers, common, or misc files are forbidden.',
      from: {},
      to: { path: '(utils|helpers|common|misc)\\.ts$' }
    }
  ],
  options: {
    doNotFollow: {
      path: 'node_modules'
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: './tsconfig.json'
    }
  }
};
