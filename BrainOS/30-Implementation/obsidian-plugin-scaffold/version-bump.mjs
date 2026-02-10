import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function bumpManifestVersion(manifest, targetVersion) {
	return {
		...manifest,
		version: targetVersion
	};
}

export function upsertVersionMapping(versions, targetVersion, minAppVersion) {
	if (Object.prototype.hasOwnProperty.call(versions, targetVersion)) {
		return versions;
	}

	return {
		...versions,
		[targetVersion]: minAppVersion
	};
}

export function runVersionBump(targetVersion = process.env.npm_package_version) {
	if (!targetVersion) {
		throw new Error('npm_package_version is required to bump plugin version files');
	}

	const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
	const nextManifest = bumpManifestVersion(manifest, targetVersion);
	writeFileSync('manifest.json', JSON.stringify(nextManifest, null, '\t'));

	const versions = JSON.parse(readFileSync('versions.json', 'utf8'));
	const nextVersions = upsertVersionMapping(versions, targetVersion, nextManifest.minAppVersion);
	writeFileSync('versions.json', JSON.stringify(nextVersions, null, '\t'));
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
	runVersionBump();
}
