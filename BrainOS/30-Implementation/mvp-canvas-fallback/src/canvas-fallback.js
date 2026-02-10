'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const KNOWN_NODE_TYPES = new Set(['text', 'file', 'link', 'group']);

function parseJson(text, filePath) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${error.message}`);
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isInteger(value) {
  return Number.isInteger(value);
}

function validateNode(node, index) {
  const errors = [];
  const where = `nodes[${index}]`;

  if (!isObject(node)) {
    return [`${where} must be an object`];
  }

  if (typeof node.id !== 'string' || node.id.trim() === '') {
    errors.push(`${where}.id must be a non-empty string`);
  }

  if (typeof node.type !== 'string' || node.type.trim() === '') {
    errors.push(`${where}.type must be a non-empty string`);
  } else if (!KNOWN_NODE_TYPES.has(node.type)) {
    errors.push(`${where}.type must be one of: ${Array.from(KNOWN_NODE_TYPES).join(', ')}`);
  }

  if (!isInteger(node.x)) {
    errors.push(`${where}.x must be an integer`);
  }

  if (!isInteger(node.y)) {
    errors.push(`${where}.y must be an integer`);
  }

  if (!isInteger(node.width)) {
    errors.push(`${where}.width must be an integer`);
  }

  if (!isInteger(node.height)) {
    errors.push(`${where}.height must be an integer`);
  }

  if (node.type === 'text' && typeof node.text !== 'string') {
    errors.push(`${where}.text must be a string for text nodes`);
  }

  if (node.type === 'file' && typeof node.file !== 'string') {
    errors.push(`${where}.file must be a string for file nodes`);
  }

  if (node.type === 'link' && typeof node.url !== 'string') {
    errors.push(`${where}.url must be a string for link nodes`);
  }

  return errors;
}

function validateEdge(edge, index) {
  const errors = [];
  const where = `edges[${index}]`;

  if (!isObject(edge)) {
    return [`${where} must be an object`];
  }

  if (typeof edge.id !== 'string' || edge.id.trim() === '') {
    errors.push(`${where}.id must be a non-empty string`);
  }

  if (typeof edge.fromNode !== 'string' || edge.fromNode.trim() === '') {
    errors.push(`${where}.fromNode must be a non-empty string`);
  }

  if (typeof edge.toNode !== 'string' || edge.toNode.trim() === '') {
    errors.push(`${where}.toNode must be a non-empty string`);
  }

  return errors;
}

function validateCanvasStructure(canvas) {
  const errors = [];

  if (!isObject(canvas)) {
    return { valid: false, errors: ['canvas must be a JSON object'] };
  }

  const nodes = canvas.nodes === undefined ? [] : canvas.nodes;
  const edges = canvas.edges === undefined ? [] : canvas.edges;

  if (!Array.isArray(nodes)) {
    errors.push('nodes must be an array');
  }

  if (!Array.isArray(edges)) {
    errors.push('edges must be an array');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const nodeIds = new Set();

  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i];
    const nodeErrors = validateNode(node, i);
    errors.push(...nodeErrors);

    if (isObject(node) && typeof node.id === 'string') {
      if (nodeIds.has(node.id)) {
        errors.push(`nodes[${i}].id duplicates an existing node id: ${node.id}`);
      }
      nodeIds.add(node.id);
    }
  }

  for (let i = 0; i < edges.length; i += 1) {
    const edge = edges[i];
    const edgeErrors = validateEdge(edge, i);
    errors.push(...edgeErrors);

    if (isObject(edge) && typeof edge.fromNode === 'string' && !nodeIds.has(edge.fromNode)) {
      errors.push(`edges[${i}].fromNode references missing node id: ${edge.fromNode}`);
    }

    if (isObject(edge) && typeof edge.toNode === 'string' && !nodeIds.has(edge.toNode)) {
      errors.push(`edges[${i}].toNode references missing node id: ${edge.toNode}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

async function readCanvasFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const canvas = parseJson(raw, filePath);
  const validation = validateCanvasStructure(canvas);

  return { raw, canvas, validation };
}

function buildSuggestedPath(targetCanvasPath) {
  if (!targetCanvasPath.endsWith('.canvas')) {
    throw new Error(`Expected a .canvas file: ${targetCanvasPath}`);
  }

  return targetCanvasPath.replace(/\.canvas$/, '-suggested.canvas');
}

function normalizeCanvasJson(canvas) {
  return `${JSON.stringify(canvas, null, 2)}\n`;
}

async function writeSuggestedCanvas(targetCanvasPath, proposedCanvas, options = {}) {
  const { overwrite = false } = options;

  const validation = validateCanvasStructure(proposedCanvas);
  if (!validation.valid) {
    throw new Error(`Refusing to write invalid suggested canvas: ${validation.errors.join('; ')}`);
  }

  const suggestedCanvasPath = buildSuggestedPath(targetCanvasPath);

  if (!overwrite) {
    try {
      await fs.access(suggestedCanvasPath);
      throw new Error(`Suggested canvas already exists: ${suggestedCanvasPath}`);
    } catch (error) {
      if (error && error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  await fs.mkdir(path.dirname(suggestedCanvasPath), { recursive: true });
  await fs.writeFile(suggestedCanvasPath, normalizeCanvasJson(proposedCanvas), 'utf8');

  return { suggestedCanvasPath, validation };
}

async function applySuggestedCanvas(params) {
  const {
    targetCanvasPath,
    suggestedCanvasPath = buildSuggestedPath(targetCanvasPath),
    approved = false,
    injectFailureAfterBackup = false,
  } = params;

  if (!approved) {
    throw new Error('Explicit user approval is required to overwrite canvas (--approve).');
  }

  const targetData = await readCanvasFile(targetCanvasPath);
  if (!targetData.validation.valid) {
    throw new Error(`Target canvas is invalid; refusing to overwrite: ${targetData.validation.errors.join('; ')}`);
  }

  const suggestedData = await readCanvasFile(suggestedCanvasPath);
  if (!suggestedData.validation.valid) {
    throw new Error(`Suggested canvas is invalid; refusing to apply: ${suggestedData.validation.errors.join('; ')}`);
  }

  const backupPath = `${targetCanvasPath}.bak.${Date.now()}`;
  await fs.copyFile(targetCanvasPath, backupPath);

  try {
    if (injectFailureAfterBackup) {
      throw new Error('Injected failure after backup (test only)');
    }
    await fs.writeFile(targetCanvasPath, suggestedData.raw, 'utf8');
  } catch (error) {
    await fs.copyFile(backupPath, targetCanvasPath);
    throw new Error(`Apply failed; original canvas restored from backup. Cause: ${error.message}`);
  }

  return {
    targetCanvasPath,
    suggestedCanvasPath,
    backupPath,
  };
}

module.exports = {
  KNOWN_NODE_TYPES,
  applySuggestedCanvas,
  buildSuggestedPath,
  readCanvasFile,
  validateCanvasStructure,
  writeSuggestedCanvas,
};
