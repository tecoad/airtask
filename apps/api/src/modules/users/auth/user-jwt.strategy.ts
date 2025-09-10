import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CONSTANTS } from 'src/config/constants';
import { ENV } from 'src/config/env';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { SessionStatus } from 'src/shared/types/db';
import { UserJwtPayload } from '../types';

export const userJwtExtractor = ExtractJwt.fromExtractors([
	ExtractJwt.fromAuthHeaderAsBearerToken(),
	(request: Request) => {
		return request?.cookies?.[CONSTANTS.USERS.cookie_name];
	},
]);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
	constructor(private readonly prisma: PrismaService) {
		super({
			jwtFromRequest: userJwtExtractor,
			ignoreExpiration: false,
			secretOrKey: ENV.USERS.jwt_token_secret,
		});
	}

	async validate(payload: UserJwtPayload) {
		try {
			const { user } = await this.prisma.session.findUniqueOrThrow({
				where: {
					id: payload.sessionId,
					status: SessionStatus.Valid,
				},
			});

			if (user !== payload.id) throw new Error();

			return payload;
		} catch {
			throw new UnauthorizedException('UNAUTHORIZED');
		}
	}
}
