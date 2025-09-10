import { GraphQLResolveInfo } from 'graphql';

export function getOperationName(info: GraphQLResolveInfo): string | number {
	let path = info.path;
	while (path.prev) {
		path = path.prev;
	}
	return path.key;
}
