import {
	IsArray,
	IsBoolean,
	IsEmail,
	IsNotEmpty,
	IsNotEmptyObject,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class CustomerTicket {
	@IsNotEmpty()
	@IsString()
	readonly firstName: string;

	@IsNotEmpty()
	@IsString()
	readonly lastName: string;

	@IsNotEmpty()
	@IsEmail()
	readonly email: string;
}

export class AddressTicket {
	@IsString()
	Logradouro: string;

	@IsString()
	Number: string;

	@IsString()
	Complemento: string;

	@IsString()
	Bairro: string;

	@IsString()
	Cidade: string;

	@IsString()
	UF: string;

	@IsString()
	CEP: string;
}

export class OrderTicket {
	@IsString()
	Number: string;

	@IsString()
	ShippingMethod: string;

	@IsNotEmptyObject()
	Address: AddressTicket;

	@IsString()
	EstimateDeliveryDate: string;

	@IsString()
	Status: string;

	@IsString()
	TrackingURL: string;
}

export class threadObject {
	@IsString()
	readonly type: string;

	@IsNotEmptyObject()
	readonly customer: Partial<CustomerTicket>;

	@IsString()
	readonly text: string;
}

export class CreateTicketDTO {
	@IsNotEmpty()
	@IsBoolean()
	readonly autoReply: boolean;

	@IsString()
	readonly subject: string;

	@IsNotEmptyObject()
	readonly customer: CustomerTicket;

	@IsNumber()
	readonly mailboxId: number;

	@IsNotEmpty()
	@IsString()
	readonly type: string;

	@IsNotEmpty()
	@IsString()
	readonly status: string;

	@IsOptional()
	@IsNumber()
	readonly assignTo: number;

	@IsArray()
	readonly threads: threadObject[];

	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	readonly tags: string[];
}
