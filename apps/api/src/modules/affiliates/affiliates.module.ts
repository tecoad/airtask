import { Module, forwardRef } from '@nestjs/common';
import { AccountsModule } from '../accounts/accounts.module';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { AffiliateComissionsController } from './controllers/affiliate-comission.controller';
import { AffiliateComissionsService } from './services/affiliate-comissions.service';
import { AffiliatesService } from './services/affiliates.service';

@Module({
	imports: [
		forwardRef(() => CommonModule),
		forwardRef(() => AccountsModule),
		forwardRef(() => UsersModule),
	],
	providers: [AffiliatesService, AffiliateComissionsService],
	exports: [AffiliatesService, AffiliateComissionsService],
	controllers: [AffiliateComissionsController],
})
export class AffiliatesModule {}
