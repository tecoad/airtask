import { FileItem } from '@directus/sdk';
import { Args, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { FileUpload } from 'graphql-upload';
import { resolveAssetName } from 'src/shared/utils/resolve-asset-name';
import { AssetsService } from '../../../assets/services/assets.service';

@Resolver('Asset')
export class AssetsResolver {
	constructor(private readonly assetsService: AssetsService) {}

	@Mutation()
	async uploadFile(@Args('file') files: { file: FileUpload }[]) {
		const result: any[] = [];

		for (const upload of Array.isArray(files) ? files : [files]) {
			if ('promise' in upload) {
				await upload.promise;
			}
			await upload;
			const { file } = upload;

			const created = await this.assetsService.uploadFile(
				file.createReadStream() as any,
				file.filename,
			);

			result.push(created);
		}

		return result;
	}

	@ResolveField()
	url(@Parent() { id }: any) {
		return resolveAssetName(id);
	}

	@ResolveField()
	filesize(@Parent() item: FileItem) {
		return item.filesize.toString();
	}
}
