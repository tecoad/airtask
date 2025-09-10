import { FileItem } from '@directus/sdk';
import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { CONSTANTS } from 'src/config/constants';
import { AssetsService } from 'src/modules/assets/services/assets.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { CommonModule } from '../../common/common.module';

jest.setTimeout(10000);
const testingFolder = 'Folder';

describe('AssetsService', () => {
	let service: AssetsService;
	let module: TestingModule;

	beforeAll(async () => {
		module = await Test.createTestingModule({
			imports: [CommonModule, HttpModule],
			providers: [AssetsService, { provide: PrismaService, useValue: {} }],
		}).compile();

		service = module.get<AssetsService>(AssetsService);

		const { tempFolderPath } = CONSTANTS.FILES;
		// Delete all files in temp folder
		// so each test can start with a clean environment
		for (const file of fs.readdirSync(tempFolderPath)) {
			fs.unlinkSync(path.join(tempFolderPath, file));
		}
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(async () => {
		await module.get(PrismaService).onModuleDestroy();

		await module.close();
	});

	it('ensures temporary directory existence on setup', async () => {
		const { tempFolderPath } = CONSTANTS.FILES;

		expect(fs.existsSync(tempFolderPath)).toBe(true);
	});

	it('generates a pdf ', async () => {
		const result = await service.generatePdf(new PDFDocument());

		const files = fs.readdirSync(path.join(CONSTANTS.FILES.tempFolderPath));
		expect(files).toHaveLength(1);

		expect(result).toBeInstanceOf(fs.ReadStream);
	});

	it('uploads a file', async () => {
		const result = await service.uploadFile(
			fs.createReadStream(path.join(__dirname, './testing/mocked-file.pdf')),
			'the-file-name',
		);

		expect(result).toEqual(
			expect.objectContaining(<FileItem>{
				id: expect.any(String),
				filename_download: 'the-file-name',
			}),
		);
	});

	it('uploads a file with a folder', async () => {
		const folder = await service.getDirectusFolder(testingFolder);

		const result = await service.uploadFile(
			fs.createReadStream(path.join(__dirname, './testing/mocked-file.pdf')),
			undefined,
			folder,
		);

		expect(result).toEqual(
			expect.objectContaining(<FileItem>{
				id: expect.any(String),
				folder: folder!.id,
			}),
		);
	});

	it('gets a folder', async () => {
		const folderName = testingFolder;
		const result = await service.getDirectusFolder(folderName);

		expect(result).toEqual(
			expect.objectContaining({
				name: folderName,
			}),
		);
	});
});
