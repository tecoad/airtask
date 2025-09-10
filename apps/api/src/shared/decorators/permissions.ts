import { SetMetadata } from '@nestjs/common';
import { Permissions } from 'src/admin-graphql';

export const PERMISSIONS_METADATA_KEY = 'permissions';

export const Allow = (...permissions: Permissions[]) =>
	SetMetadata('permissions', permissions);
