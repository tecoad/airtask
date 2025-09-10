import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/common/services/prisma.service';

@Injectable()
export class MetricsService {
	constructor(private readonly prisma: PrismaService) {}

	quotationRequestByPeriod(from: Date, to: Date) {
		return this.prisma.quotation_request.findMany({
			where: {
				date_created: {
					gte: from,
					lte: to,
				},
			},
			include: {
				quotation_conversation_quotation_request_quotation_conversationToquotation_conversation:
					{
						include: {
							quotation_quotation_conversation_quotationToquotation: true,
						},
					},
			},
		});
	}

	quotationConversationByPeriod(from: Date, to: Date) {
		return this.prisma.quotation_conversation.findMany({
			where: {
				date_created: {
					gte: from,
					lte: to,
				},
			},
		});
	}
}
