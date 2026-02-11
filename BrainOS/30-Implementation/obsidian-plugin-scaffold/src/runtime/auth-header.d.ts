import type { RuntimeAuthSettings } from '../settings';

export type SecretStorageLike = {
	getSecret: (id: string) => string | null | Promise<string | null>;
};

export function resolveBasicAuthHeader(options: {
	auth: RuntimeAuthSettings | null;
	secretStorage: SecretStorageLike;
	encodeBase64: (value: string) => string;
}): Promise<string | null>;
