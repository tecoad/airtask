import { CanActivate, ExecutionContext, HttpException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { PrismaService } from 'src/modules/common/services/prisma.service';

@Injectable()
export class AccountApiAuthGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request: Request = context.switchToHttp().getRequest();

		const auth = (request.headers['authorization'] ||
			request.headers['Authorization']) as string | undefined;

		const err = ['Invalid API key', StatusCodes.UNAUTHORIZED] as const;

		if (!auth || typeof auth !== 'string') {
			throw new HttpException(...err);
		}

		const [type, token] = auth.split(' ');
		const apiKey = await this.prisma.account_api_key.findUnique({
				where: {
					token,
				},
				include: {
					account_account_api_key_accountToaccount: true,
				},
			}),
			account = apiKey?.account_account_api_key_accountToaccount;

		if (type !== 'Bearer' || !apiKey || !apiKey.account) throw new HttpException(...err);

		(request as any).account = account;

		return true;
	}
}
