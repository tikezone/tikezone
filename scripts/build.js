#!/usr/bin/env node
/**
 * Forces Next.js to use Webpack instead of Turbopack for production builds.
 * This avoids the Windows "Access is denied (os error 5)" spawn issue.
 */
const { spawnSync } = require('child_process');

const nextBin = require.resolve('next/dist/bin/next');
const extraArgs = process.argv.slice(2);

const result = spawnSync(process.execPath, [nextBin, 'build', '--webpack', ...extraArgs], {
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
