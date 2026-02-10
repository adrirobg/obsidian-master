'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  applySuggestedCanvas,
  buildSuggestedPath,
  validateCanvasStructure,
  writeSuggestedCanvas,
} = require('../src/canvas-fallback');

const BASE_CANVAS = {
  nodes: [
    {
      id: 'n1',
      type: 'text',
      x: 10,
      y: 20,
      width: 200,
      height: 100,
      text: 'Hola',
    },
    {
      id: 'n2',
      type: 'file',
      x: 260,
      y: 20,
      width: 220,
      height: 120,
      file: 'README.md',
    },
  ],
  edges: [
    {
      id: 'e1',
      fromNode: 'n1',
      toNode: 'n2',
    },
  ],
};

async function withTempDir(run) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'canvas-fallback-'));
  try {
    return await run(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test('validateCanvasStructure accepts a valid canvas', () => {
  const result = validateCanvasStructure(BASE_CANVAS);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validateCanvasStructure rejects edges with missing node reference', () => {
  const invalid = {
    ...BASE_CANVAS,
    edges: [{ id: 'e1', fromNode: 'missing', toNode: 'n2' }],
  };

  const result = validateCanvasStructure(invalid);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes('references missing node id: missing')));
});

test('writeSuggestedCanvas writes *-suggested.canvas for a valid proposal', async () => {
  await withTempDir(async (dir) => {
    const targetPath = path.join(dir, 'board.canvas');
    await fs.writeFile(targetPath, JSON.stringify(BASE_CANVAS), 'utf8');

    const result = await writeSuggestedCanvas(targetPath, BASE_CANVAS);
    assert.equal(result.suggestedCanvasPath, path.join(dir, 'board-suggested.canvas'));

    const saved = JSON.parse(await fs.readFile(result.suggestedCanvasPath, 'utf8'));
    assert.equal(saved.nodes.length, 2);
  });
});

test('applySuggestedCanvas requires explicit approval', async () => {
  await withTempDir(async (dir) => {
    const targetPath = path.join(dir, 'board.canvas');
    const suggestedPath = buildSuggestedPath(targetPath);
    await fs.writeFile(targetPath, JSON.stringify(BASE_CANVAS), 'utf8');
    await fs.writeFile(suggestedPath, JSON.stringify(BASE_CANVAS), 'utf8');

    await assert.rejects(
      () => applySuggestedCanvas({ targetCanvasPath: targetPath, approved: false }),
      /Explicit user approval is required/
    );
  });
});

test('applySuggestedCanvas overwrites target and creates backup when approved', async () => {
  await withTempDir(async (dir) => {
    const targetPath = path.join(dir, 'board.canvas');
    const suggestedPath = buildSuggestedPath(targetPath);

    await fs.writeFile(targetPath, JSON.stringify(BASE_CANVAS), 'utf8');

    const updated = JSON.parse(JSON.stringify(BASE_CANVAS));
    updated.nodes[0].text = 'Texto actualizado';
    await fs.writeFile(suggestedPath, JSON.stringify(updated), 'utf8');

    const result = await applySuggestedCanvas({ targetCanvasPath: targetPath, approved: true });

    const finalCanvas = JSON.parse(await fs.readFile(targetPath, 'utf8'));
    assert.equal(finalCanvas.nodes[0].text, 'Texto actualizado');

    const backup = JSON.parse(await fs.readFile(result.backupPath, 'utf8'));
    assert.equal(backup.nodes[0].text, 'Hola');
  });
});

test('applySuggestedCanvas rolls back target when write fails after backup', async () => {
  await withTempDir(async (dir) => {
    const targetPath = path.join(dir, 'board.canvas');
    const suggestedPath = buildSuggestedPath(targetPath);

    await fs.writeFile(targetPath, JSON.stringify(BASE_CANVAS), 'utf8');

    const updated = JSON.parse(JSON.stringify(BASE_CANVAS));
    updated.nodes[0].text = 'No debe persistir';
    await fs.writeFile(suggestedPath, JSON.stringify(updated), 'utf8');

    await assert.rejects(
      () => applySuggestedCanvas({ targetCanvasPath: targetPath, approved: true, injectFailureAfterBackup: true }),
      /original canvas restored from backup/
    );

    const finalCanvas = JSON.parse(await fs.readFile(targetPath, 'utf8'));
    assert.equal(finalCanvas.nodes[0].text, 'Hola');
  });
});

test('applySuggestedCanvas uses unique backup path when timestamp backup already exists', async () => {
  await withTempDir(async (dir) => {
    const targetPath = path.join(dir, 'board.canvas');
    const suggestedPath = buildSuggestedPath(targetPath);

    await fs.writeFile(targetPath, JSON.stringify(BASE_CANVAS), 'utf8');
    await fs.writeFile(suggestedPath, JSON.stringify(BASE_CANVAS), 'utf8');

    const fixedTimestamp = 1700000000000;
    const existingBackupPath = `${targetPath}.bak.${fixedTimestamp}`;
    await fs.writeFile(existingBackupPath, 'existing-backup', 'utf8');

    const originalDateNow = Date.now;
    Date.now = () => fixedTimestamp;

    try {
      const result = await applySuggestedCanvas({ targetCanvasPath: targetPath, approved: true });
      assert.equal(result.backupPath, `${existingBackupPath}.1`);

      const existingBackup = await fs.readFile(existingBackupPath, 'utf8');
      assert.equal(existingBackup, 'existing-backup');
    } finally {
      Date.now = originalDateNow;
    }
  });
});
