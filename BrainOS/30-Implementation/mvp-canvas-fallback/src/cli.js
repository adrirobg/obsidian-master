#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const {
  applySuggestedCanvas,
  readCanvasFile,
  writeSuggestedCanvas,
} = require('./canvas-fallback');

function printUsage() {
  console.log('Usage:');
  console.log('  node src/cli.js validate <canvas-path>');
  console.log('  node src/cli.js propose <target-canvas-path> <proposed-canvas-json-path> [--overwrite]');
  console.log('  node src/cli.js apply <target-canvas-path> [--suggested <suggested-canvas-path>] --approve');
}

function parseFlag(args, name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return null;
  }

  return args[index + 1] || null;
}

async function run() {
  const [, , command, ...args] = process.argv;

  if (!command) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (command === 'validate') {
    const canvasPath = args[0];
    if (!canvasPath) {
      throw new Error('Missing <canvas-path>');
    }

    const { validation } = await readCanvasFile(canvasPath);
    if (!validation.valid) {
      console.error('INVALID');
      for (const error of validation.errors) {
        console.error(`- ${error}`);
      }
      process.exitCode = 2;
      return;
    }

    console.log('VALID');
    return;
  }

  if (command === 'propose') {
    const targetCanvasPath = args[0];
    const proposedPath = args[1];
    const overwrite = args.includes('--overwrite');

    if (!targetCanvasPath || !proposedPath) {
      throw new Error('Missing required args: <target-canvas-path> <proposed-canvas-json-path>');
    }

    const proposedJson = await fs.readFile(proposedPath, 'utf8');
    const proposedCanvas = JSON.parse(proposedJson);

    const result = await writeSuggestedCanvas(targetCanvasPath, proposedCanvas, { overwrite });
    console.log(`SUGGESTED_WRITTEN ${result.suggestedCanvasPath}`);
    return;
  }

  if (command === 'apply') {
    const targetCanvasPath = args[0];
    if (!targetCanvasPath) {
      throw new Error('Missing <target-canvas-path>');
    }

    const approved = args.includes('--approve');
    const suggestedCanvasPath = parseFlag(args, '--suggested');

    const result = await applySuggestedCanvas({
      targetCanvasPath,
      suggestedCanvasPath: suggestedCanvasPath || undefined,
      approved,
    });

    console.log(`APPLIED ${result.targetCanvasPath}`);
    console.log(`BACKUP ${result.backupPath}`);
    return;
  }

  printUsage();
  process.exitCode = 1;
}

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
