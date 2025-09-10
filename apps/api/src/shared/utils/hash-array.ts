import * as crypto from 'crypto';

// Função para criar um hash SHA-256
function createHash(data: string): string {
	return crypto.createHash('sha256').update(data).digest('hex');
}

export const hashArray = (arr: any[]) => {
	return createHash(JSON.stringify(arr));
};

declare global {
	interface BigInt {
		/** Convert to BigInt to string form in JSON.stringify */
		toJSON: () => string;
	}
}
BigInt.prototype.toJSON = function () {
	return this.toString();
};
