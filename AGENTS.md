# Project Instructions

These rules apply to all work in this repository.

## Current phase

- The repository is specification-only until the owner approves implementation.
- Do not select a framework, create product code, deploy, or publish without explicit approval.
- Keep the product UI simple; reliability and draw integrity matter more than animation.

## Modularity baseline

- One responsibility per module.
- Target 80–120 physical lines for a cohesive production module.
- Hand-written first-party source, test, script, and stylesheet files must stay below 180 physical lines.
- Functions, methods, hooks, and handlers must stay below 30 physical lines.
- Do not create tiny pass-through files merely to satisfy a line limit; cohesion wins inside the hard limits.
- Put clock, randomness, persistence, network, rendering, and other side effects behind narrow explicit adapters.
- Keep domain logic independent from UI and infrastructure.
- Do not hide application logic in generated files, configuration, fixtures, schemas, or migrations.
- Any exception requires a written reason in a reviewed allowlist.

## Required quality gates before shipping

- Enforce file and function size limits in CI.
- Enforce import boundaries and detect dependency cycles.
- Keep domain imports pointing inward: `web/server/adapters -> application -> domain`.
- Test draw invariants, server-time behavior, reload recovery, and accessibility.
- Use focused tests for each module, then run the full repository gate.
- Keep structural refactors separate from behavior changes.

## Safety and fairness

- Never use `Math.random()` or another predictable PRNG for the production draw.
- Never expose unrevealed assignments through HTML, JavaScript bundles, API responses, logs, or client state.
- Treat server time as authoritative. A browser tab must not control draw progress.
- Once the production draw is locked, roster, divisions, start time, interval, and commitment cannot change silently.
