import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { PineconeClient } from '@pinecone-database/pinecone';
import { ENV } from 'src/config/env';

export type Vector = {
	id: string;
	data: number[];
	metadata: Record<string, any>;
};
export type WithScoreVector = {
	id: string;
	data: number[];
	metadata: Record<string, any>;
	score: number;
};

type FilteringOperator = '$eq' | '$ne' | '$gt' | '$gte' | '$lt' | '$lte' | '$in' | '$nin';

export type MetadataFiltering<B extends Record<string, string | number | boolean>> = {
	[K in keyof B]: {
		[key in FilteringOperator]?: B[K] | B[K][];
	};
};

@Injectable()
export class VectorIndexingService implements OnApplicationBootstrap {
	api: PineconeClient;

	constructor() {
		this.api = new PineconeClient();
	}

	private readonly readSubscribers: (() => void)[] = [];
	onReady(callback: () => Promise<void> | void) {
		this.readSubscribers.push(callback);
	}

	/**
	 * Return db index
	 */
	getIndex(name: string) {
		return this.api.Index(name);
	}

	async update(
		indexName: string,
		data: {
			id: string;
			setMetadata: Record<string, any>;
			vector: number[];
		},
	) {
		await this.getIndex(indexName).update({
			updateRequest: {
				id: data.id,
				setMetadata: data.setMetadata,
				values: data.vector,
			},
		});
	}

	async upsert(indexName: string, vectors: Vector[]) {
		const data = await this.getIndex(indexName).upsert({
			upsertRequest: {
				vectors: vectors.map((v) => ({
					id: v.id,
					values: v.data,
					metadata: v.metadata,
				})),
				namespace: '',
			},
		});

		return { upsertedCount: data.upsertedCount };
	}

	async query<D extends Record<string, string | number | boolean>>(
		indexName: string,
		input: {
			vector: number[];
			topK: number;

			filter: MetadataFiltering<D>;
		},
	) {
		const { matches } = await this.getIndex(indexName).query({
			queryRequest: {
				vector: input.vector,
				topK: input.topK,
				includeMetadata: true,
				filter: input.filter,
			},
		});

		return matches?.map(
			(v) =>
				<WithScoreVector>{
					id: v.id,
					data: v.values,
					metadata: v.metadata,
					score: v.score,
				},
		);
	}

	async delete(
		indexName: string,
		input: {
			ids: string[];
		},
	) {
		await this.getIndex(indexName)._delete({
			deleteRequest: {
				ids: input.ids,
			},
		});
	}

	async onApplicationBootstrap() {
		await this.api.init({
			environment: ENV.PINECONE.environment!,
			apiKey: ENV.PINECONE.api_key!,
		});

		for (const fn of this.readSubscribers) {
			fn();
		}
	}
}
