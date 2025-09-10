import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const prod = dotenv.parse(fs.readFileSync(path.join(process.cwd(), 'prod.env')));
const dev = dotenv.parse(fs.readFileSync(path.join(process.cwd(), 'dev.env')));

function compareObjects(obj1: object, obj2: object): string[] {
	const missingKeys: string[] = [];

	for (const key in obj1) {
		if (!obj2.hasOwnProperty(key)) {
			missingKeys.push(key);
		}
	}

	return missingKeys;
}

console.log('Keys that are in dev but not in prod ->', compareObjects(dev, prod));

console.log('Keys that are in prod but not in dev ->', compareObjects(prod, dev));
