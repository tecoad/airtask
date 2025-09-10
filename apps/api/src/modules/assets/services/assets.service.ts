import { DefaultItem, FileItem, FolderItem } from '@directus/sdk';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosRequestConfig } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { lastValueFrom } from 'rxjs';
import { CONSTANTS } from 'src/config/constants';
import { v4 } from 'uuid';
import { DirectusSdk } from '../../common/services/directus-sdk.service';

const { tempFolderPath } = CONSTANTS.FILES;

@Injectable()
export class AssetsService {
	private readonly logger = new Logger(AssetsService.name);
	constructor(
		private readonly directusSdk: DirectusSdk,
		private readonly httpService: HttpService,
	) {
		this.ensureDirectoryExistence(tempFolderPath);
	}

	async generatePdf(doc: typeof PDFDocument): Promise<fs.ReadStream> {
		const fileName = path.join(tempFolderPath, `${v4()}.pdf`);

		const file = fs.createWriteStream(fileName);
		doc.pipe(file);
		doc.end();

		const data = await new Promise<fs.ReadStream>((res) => {
			file.on('finish', () => {
				const readStream = fs.createReadStream(fileName);

				readStream.on('finish', () => {
					readStream.close();
				});

				file.close();

				res(readStream);
			});
		});

		return data;
	}

	async uploadFile(
		file: fs.ReadStream,
		fileName?: string,
		folder?: FolderItem,
	): Promise<DefaultItem<FileItem<unknown>>> {
		const form = new FormData();

		form.append(
			'file',
			file as any,
			fileName
				? {
						filename: fileName,
				  }
				: undefined,
		);

		const service = this.directusSdk.files;

		let item = await service.createOne(
			form,
			{},
			{
				requestOptions: {
					headers: form.getHeaders(),
				},
			},
		);

		if (folder) {
			// Work around for directus issue
			// which does not allow to create a file with a folder
			item = await service.updateOne(item!.id, {
				folder: folder.id,
			});
		}

		return item!;
	}

	deleteFile(id: string) {
		return this.directusSdk.files.deleteOne(id);
	}

	async uploadFromUrl({
		url,
		folder,
		requestConfig,
		type,
	}: {
		url: string;
		folder?: FolderItem;
		requestConfig?: Omit<AxiosRequestConfig, 'responseType'>;
		type: string;
	}) {
		const res = await lastValueFrom(
			this.httpService.get(url, {
				responseType: 'stream',
				...(requestConfig as any),
			}),
		);

		const fileName = path.resolve(tempFolderPath, `${v4()}.${type}`);

		const file = fs.createWriteStream(fileName);
		res.data.pipe(file);

		const data = await new Promise<fs.ReadStream>((res) => {
			file.on('finish', () => {
				const readStream = fs.createReadStream(fileName);
				readStream.on('end', () => {
					readStream.close();
				});

				file.close();

				res(readStream);
			});
		});

		return this.uploadFile(data, undefined, folder);
	}

	async getDirectusFolder(folderName: string): Promise<FolderItem | undefined> {
		const items = await this.directusSdk.folders.readByQuery({
			filter: {
				name: {
					_eq: folderName,
				},
			},
		});

		const folder = items.data?.[0];

		if (!folder) {
			this.logger.error(`Folder ${folder} not found`);

			return undefined;
		}

		return folder;
	}

	private ensureDirectoryExistence(filePath: string) {
		fs.existsSync(filePath) || fs.mkdirSync(filePath);
	}
}
