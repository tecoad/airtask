import { Module, forwardRef } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { UsersModule } from '../users/users.module';
import { SimulationModeService } from './services/simulation-mode.service';
import { AdminUsersManagerService } from './services/users-manager.service';

const providersAndExports = [SimulationModeService, AdminUsersManagerService];

@Module({
	imports: [CommonModule, forwardRef(() => UsersModule)],
	providers: [...providersAndExports],
	exports: providersAndExports,
})
export class AdminModule {}
