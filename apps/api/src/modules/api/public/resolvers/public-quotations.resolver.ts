import { ID } from '@directus/sdk';
import {
	Args,
	Context,
	Mutation,
	Parent,
	Query,
	ResolveField,
	Resolver,
	Subscription,
} from '@nestjs/graphql';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { quotation } from '@prisma/client';
import { PubSub } from 'graphql-subscriptions';
import { Observable } from 'rxjs';
import { PublicQuotationsService } from 'src/modules/quotations/services/public-quotations.service';
import { WidgetConfigService } from 'src/modules/quotations/services/widget-config.service';
import {
	QuotationConversationRecipientInput,
	SendQuotationConversationMessageInput,
} from 'src/public-graphql';
import { MyContext } from 'src/shared/graphql/types';

@Resolver('PublicQuotation')
export class PublicQuotationsResolver {
	constructor(
		private readonly publicQuotationsService: PublicQuotationsService,
		private readonly widgetConfigService: WidgetConfigService,
	) {}

	@Query()
	publicQuotation(@Args('hash') hash: string, @Args('id') id: ID) {
		return this.publicQuotationsService.findPublic(hash, id);
	}

	@Query()
	quotationConversation(@Args('id') id: string) {
		return this.publicQuotationsService.findQuotationConversation(id);
	}

	@Query()
	findPublicWithoutAvailabilityCheck(@Args('hash') hash: string, @Args('id') id: ID) {
		return this.publicQuotationsService.findPublicWithoutAvailabilityCheck(hash, id);
	}

	@Subscription()
	initQuotationConversation(
		@Context() ctx: MyContext,
		@Args('hash') hash: string,
		@Args('recipient')
		recipient: QuotationConversationRecipientInput | undefined,
	) {
		const obs = this.publicQuotationsService.initQuotationConversation(hash, recipient);

		if (obs instanceof Observable) {
			return this.observableToAsyncIterator('initQuotationConversation', obs);
		}

		return obs;
	}

	@Subscription()
	async sendQuotationConversationMessage(
		@Args('input') input: SendQuotationConversationMessageInput,
	) {
		const obs = await this.publicQuotationsService.sendQuotationConversationMessage(
			input.conversationId,
			input.message,
		);

		return this.observableToAsyncIterator('sendQuotationConversationMessage', obs);
	}

	private observableToAsyncIterator<V>(name: string, obs: Observable<V>) {
		const pubSub = new PubSub();

		obs.subscribe({
			next(value) {
				pubSub.publish(name, {
					[name]: value,
				});
			},
		});

		return pubSub.asyncIterator(name);
	}

	@Mutation()
	updateQuotationConversationRecipient(
		@Args('quotationConversationId') quotationConversationId: ID,
		@Args('recipient') recipient: QuotationConversationRecipientInput,
	) {
		return this.publicQuotationsService.updateQuotationConversationRecipient(
			quotationConversationId,
			recipient,
		);
	}

	@ResolveField('widget_config')
	widgetConfig(@Parent() quotation: quotation) {
		return this.widgetConfigService.findForQuotationHashOrId(quotation.hash);
	}
}
