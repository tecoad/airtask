import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { adminApolloDriverConfig } from 'src/config/admin-apollo-driver.config';
import { privateApolloDriverConfig } from 'src/config/private-apollo-driver.config';
import { publicApolloDriverConfig } from 'src/config/public-apollo-driver.config';
import { AccountPublicApiModule } from './accounts-public/accounts-public.module';
import { AdminApiModule } from './admin/admin.module';
import { PrivateApiModule } from './private/private.module';
import { PublicApiModule } from './public/public.module';
import { SharedApiModule } from './shared/shared.module';

@Module({
	imports: [
		GraphQLModule.forRoot(privateApolloDriverConfig),
		GraphQLModule.forRoot(publicApolloDriverConfig),
		GraphQLModule.forRoot(adminApolloDriverConfig),

		SharedApiModule,
		PrivateApiModule,
		PublicApiModule,
		AdminApiModule,
		AccountPublicApiModule,
	],
})
export class ApiModule {}
