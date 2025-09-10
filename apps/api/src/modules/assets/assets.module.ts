import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { AssetsResolver } from '../api/shared/resolvers/assets.resolver';
import { CommonModule } from '../common/common.module';
import { AssetsService } from './services/assets.service';

@Module({
	imports: [forwardRef(() => CommonModule), HttpModule],
	providers: [AssetsService, AssetsResolver],
	exports: [AssetsService],
})
export class AssetsModule {}
