import { ResolveField, Resolver } from '@nestjs/graphql';
import {
	ResetUserPasswordResult,
	UserAuthResult,
	VerifyUserEmailResult,
} from 'src/graphql';

@Resolver('UserAuthResult')
export class UserAuthResultResolver {
	@ResolveField()
	__resolveType(value: UserAuthResult) {
		if ('email' in value) {
			return 'ActiveUser';
		}

		if ('errorCode' in value) {
			return 'UserAuthError';
		}

		return null;
	}
}

@Resolver('RegisterUserResult')
export class RegisterUserResultResolver {
	@ResolveField()
	__resolveType(value: UserAuthResult) {
		if ('should_verify_email' in value) {
			return 'UserRegistered';
		}

		if ('errorCode' in value) {
			return 'UserAuthError';
		}

		return null;
	}
}

@Resolver('VerifyUserEmailResult')
export class VerifyUserEmailResultResolver {
	@ResolveField()
	__resolveType(value: VerifyUserEmailResult) {
		if ('email' in value) {
			return 'ActiveUser';
		}

		if ('errorCode' in value) {
			return 'VerifyUserEmailError';
		}

		return null;
	}
}

@Resolver('ResetUserPasswordResult')
export class ResetUserPasswordResultResolver {
	@ResolveField()
	__resolveType(value: ResetUserPasswordResult) {
		if ('email' in value) {
			return 'ActiveUser';
		}

		if ('errorCode' in value) {
			return 'ResetUserPasswordError';
		}

		return null;
	}
}

export const usersUnionsResolvers = [
	UserAuthResultResolver,
	RegisterUserResultResolver,
	VerifyUserEmailResultResolver,
	ResetUserPasswordResultResolver,
];
