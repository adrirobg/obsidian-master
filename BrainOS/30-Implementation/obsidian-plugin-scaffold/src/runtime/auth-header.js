/**
 * @typedef {{ username: string, passwordSecretId: string } | null} RuntimeAuthSettings
 * @typedef {{ getSecret: (id: string) => string | null | Promise<string | null> }} SecretStorageLike
 */

/**
 * Resolve a Basic Authorization header from Obsidian SecretStorage.
 * Supports both sync and async secret resolvers for compatibility.
 *
 * @param {{ auth: RuntimeAuthSettings, secretStorage: SecretStorageLike, encodeBase64: (value: string) => string }} options
 * @returns {Promise<string | null>}
 */
export async function resolveBasicAuthHeader(options) {
	const { auth, secretStorage, encodeBase64 } = options;
	if (!auth) {
		return null;
	}

	const username = auth.username.trim();
	if (!username) {
		return null;
	}

	const secretId = auth.passwordSecretId.trim();
	if (!secretId) {
		return null;
	}

	const password = await Promise.resolve(secretStorage.getSecret(secretId));
	if (!password) {
		return null;
	}

	const encoded = encodeBase64(`${username}:${password}`);
	return `Basic ${encoded}`;
}
