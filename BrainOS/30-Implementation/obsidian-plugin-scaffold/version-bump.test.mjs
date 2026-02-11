import test from 'node:test';
import assert from 'node:assert/strict';
import { bumpManifestVersion, upsertVersionMapping } from './version-bump.mjs';

test('upsertVersionMapping keeps existing targetVersion mapping unchanged', () => {
	const versions = {
		'1.0.0': '1.11.4',
		'1.0.1': '1.11.4'
	};

	const result = upsertVersionMapping(versions, '1.0.1', '1.12.0');
	assert.deepEqual(result, versions);
});

test('upsertVersionMapping adds targetVersion key even when minAppVersion already exists', () => {
	const versions = {
		'1.0.0': '1.11.4'
	};

	const result = upsertVersionMapping(versions, '1.0.1', '1.11.4');
	assert.deepEqual(result, {
		'1.0.0': '1.11.4',
		'1.0.1': '1.11.4'
	});
});

test('bumpManifestVersion updates manifest version to targetVersion', () => {
	const manifest = {
		id: 'brainos-runtime-scaffold',
		version: '1.0.0',
		minAppVersion: '1.11.4'
	};

	const result = bumpManifestVersion(manifest, '1.0.1');
	assert.equal(result.version, '1.0.1');
	assert.equal(result.minAppVersion, '1.11.4');
});
