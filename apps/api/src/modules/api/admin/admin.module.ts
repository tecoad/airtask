import { Module } from '@nestjs/common';
import { AdminModule } from 'src/modules/admin/admin.module';
import { CommonModule } from 'src/modules/common/common.module';
import { PaginatedUsersListResolver } from './resolvers/paginated-users-list.resolver';
import { SimulationModeResolver } from './resolvers/simulation-mode.resolver';

const resolvers = [SimulationModeResolver, PaginatedUsersListResolver];

@Module({
	imports: [CommonModule, AdminModule],
	providers: [...resolvers],
})
export class AdminApiModule {}
