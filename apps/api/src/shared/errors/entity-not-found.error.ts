import { HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ID } from '../types/db';

export class EntityNotFoundError extends HttpException {
	constructor(entity: Prisma.ModelName, identifier: ID) {
		super('entity-not-found', 404);

		this.message = `${entity} not found with identifier ${identifier}`;
	}
}
