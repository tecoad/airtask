import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { quotation_conversation } from '@prisma/client';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { quotationConversationToRecipient } from 'src/modules/quotations/utils/normalize';
import { QuotationConversationRecipient } from 'src/public-graphql';

@Resolver('QuotationConversation')
export class QuotationConversationResolver {
	constructor(private readonly prisma: PrismaService) {}

	@ResolveField('quotation')
	quotation(@Parent() conversation: quotation_conversation) {
		return (
			conversation.quotation &&
			this.prisma.quotation.findFirst({
				where: {
					id: conversation.quotation,
				},
			})
		);
	}

	@ResolveField('recipient')
	recipient(
		@Parent() conversation: quotation_conversation,
	): QuotationConversationRecipient | null {
		return quotationConversationToRecipient(conversation);
	}
}
