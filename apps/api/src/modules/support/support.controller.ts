import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateTicketDTO } from '../common/dto/create-ticket.dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
	constructor(private readonly supportService: SupportService) {}

	@UsePipes(new ValidationPipe())
	@Post('ticket')
	createTicket(@Body() body: CreateTicketDTO) {
		return this.supportService.createTicket(body);
	}
}
