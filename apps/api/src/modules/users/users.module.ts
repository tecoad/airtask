import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccountsModule } from '../accounts/accounts.module';
import { AdminModule } from '../admin/admin.module';
import { CommonModule } from '../common/common.module';
import { UserGqlAuthGuard } from './auth/user-auth.guard';
import { JwtStrategy } from './auth/user-jwt.strategy';
import { UsersService } from './services/users.service';

@Module({
	imports: [
		forwardRef(() => AccountsModule),
		forwardRef(() => CommonModule),
		PassportModule,
		forwardRef(() => AdminModule),
		JwtModule.register({}),
	],
	providers: [UsersService, JwtStrategy, UserGqlAuthGuard],
	exports: [UsersService, UserGqlAuthGuard],
})
export class UsersModule {}
