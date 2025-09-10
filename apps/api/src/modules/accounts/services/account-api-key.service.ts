import { Injectable } from '@nestjs/common';
import { CreateAccountApiKeyInput } from 'src/graphql';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { UserJwtPayload } from 'src/modules/users/types';
import { ID } from 'src/shared/types/db';
import { v4 } from 'uuid';
import { generateAccountApiKey } from '../utils/api-key';

@Injectable()
export class AccountApiKeyService {
	constructor(private readonly prisma: PrismaService) {}

	find(id: ID) {
		return this.prisma.account_api_key.findUnique({
			where: {
				id: String(id),
			},
		});
	}

	list(accountId: ID) {
		return this.prisma.account_api_key.findMany({
			where: {
				account: Number(accountId),
			},
		});
	}

	create(user: UserJwtPayload, input: CreateAccountApiKeyInput) {
		return this.prisma.account_api_key.create({
			data: {
				id: v4(),
				token: generateAccountApiKey(),
				name: input.name,
				account: Number(input.accountId),
				created_by: user.id,
			},
		});
	}

	delete(id: ID) {
		return this.prisma.account_api_key.delete({
			where: {
				id: String(id),
			},
		});
	}
}
