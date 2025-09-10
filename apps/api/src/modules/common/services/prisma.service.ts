import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
	async onModuleInit() {
		await this.$connect();

		this.$use(async (params, next) => {
			if (params.model) {
				const data = this[params.model];

				const fieldsPresent = Object.keys(data.fields);

				if (fieldsPresent.includes('date_created')) {
					if (params.action === 'create') {
						params.args.data.date_created = new Date();
					} else if (params.action === 'createMany') {
						params.args.data = params.args.data.map((v) => {
							v.date_created = new Date();

							return v;
						});
					}
				}

				if (fieldsPresent.includes('date_updated')) {
					if (params.action === 'update') {
						params.args.data.date_updated = new Date();
					} else if (params.action === 'updateMany') {
						if (Array.isArray(params.args.data)) {
							params.args.data = params.args.data.map((v) => {
								v.args.data.date_updated = new Date();

								return v;
							});
						} else {
							params.args.data.date_updated = new Date();
						}
					}
				}
			}

			return await next(params);
		});
	}

	async onModuleDestroy() {
		await this.$disconnect();
	}
}
