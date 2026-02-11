import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBasicAuthHeader } from './auth-header.js';

test('resolveBasicAuthHeader awaits async secret resolver and returns Basic header', async () => {
	const auth = {
		username: 'opencode',
		passwordSecretId: 'runtime-password'
	};

	let requestedSecretId = null;
	const secretStorage = {
		getSecret(id) {
			requestedSecretId = id;
			return new Promise((resolve) => {
				setTimeout(() => resolve('super-secret'), 5);
			});
		}
	};

	const header = await resolveBasicAuthHeader({
		auth,
		secretStorage,
		encodeBase64: (value) => {
			assert.equal(value, 'opencode:super-secret');
			return 'b3BlbmNvZGU6c3VwZXItc2VjcmV0';
		}
	});

	assert.equal(requestedSecretId, 'runtime-password');
	assert.equal(header, 'Basic b3BlbmNvZGU6c3VwZXItc2VjcmV0');
});

test('resolveBasicAuthHeader returns null when secret is missing', async () => {
	const header = await resolveBasicAuthHeader({
		auth: {
			username: 'opencode',
			passwordSecretId: 'missing'
		},
		secretStorage: {
			getSecret() {
				return null;
			}
		},
		encodeBase64: () => 'unused'
	});

	assert.equal(header, null);
});
