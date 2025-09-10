import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PendingAffiliateSumPayload {
	@IsNotEmpty()
	@IsNumber()
	affiliateId: number;

	@IsNotEmpty()
	@IsString()
	rangeFrom: string;

	@IsNotEmpty()
	@IsString()
	rangeTo: string;
}
