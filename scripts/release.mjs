#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import process from 'node:process';

const BUMP_CHOICES = ['patch', 'minor', 'major'];

function run(cmd, args, options = {}) {
  const { capture = false, allowFailure = false } = options;
  const result = spawnSync(cmd, args, {
    stdio: capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !allowFailure) {
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }

  return result;
}

function readVersion() {
  const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
  return pkg.version;
}

function isYes(input, defaultValue = true) {
  const value = input.trim().toLowerCase();
  if (!value) {
    return defaultValue;
  }

  return ['y', 'yes'].includes(value);
}

function parseBumpType(input) {
  const value = input.trim().toLowerCase();
  if (!value) {
    return 'patch';
  }

  if (BUMP_CHOICES.includes(value)) {
    return value;
  }

  if (['1', '2', '3'].includes(value)) {
    return BUMP_CHOICES[Number(value) - 1];
  }

  throw new Error('Invalid bump type. Use 1/2/3 or patch/minor/major.');
}

async function main() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log('\nPocketBase MCP release helper\n');

    const whoami = run('npm', ['whoami'], { capture: true, allowFailure: true });
    if (whoami.status !== 0) {
      console.error('npm login belum aktif. Jalankan `npm login` dulu.');
      process.exit(1);
    }

    console.log(`Logged in as: ${whoami.stdout.trim()}`);

    const gitStatus = run('git', ['status', '--porcelain'], { capture: true });
    if (gitStatus.stdout.trim()) {
      console.error('\nGit working tree belum clean. Commit/stash dulu sebelum release.\n');
      console.error(gitStatus.stdout);
      process.exit(1);
    }

    console.log(`Current version: ${readVersion()}`);
    console.log('Select version bump:');
    console.log('1) patch (recommended)');
    console.log('2) minor');
    console.log('3) major');
    const bumpAnswer = await rl.question('Choice [1]: ');
    const bump = parseBumpType(bumpAnswer);

    const runChecksAnswer = await rl.question('Run full checks (bun run check)? [Y/n]: ');
    if (isYes(runChecksAnswer, true)) {
      run('bun', ['run', 'check']);
    }

    console.log(`\nBumping version: ${bump}`);
    run('npm', ['version', bump]);
    console.log(`New version: ${readVersion()}`);

    const publishAnswer = await rl.question('Publish to npm now? [Y/n]: ');
    if (!isYes(publishAnswer, true)) {
      console.log('Publish cancelled.');
      process.exit(0);
    }

    run('npm', ['publish', '--access', 'public']);

    const pushAnswer = await rl.question('Push commit and tags to origin? [Y/n]: ');
    if (isYes(pushAnswer, true)) {
      run('git', ['push', '--follow-tags']);
    }

    console.log('\nRelease selesai.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\nRelease gagal: ${message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
