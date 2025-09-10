export type QuotationConversationAnswer = {
	/**
	 * Question ID
	 */
	question: string;
	/**
	 * Could be undefined if the question is a child of a question with condition
	 * and was put here because the condition was met in the parent question
	 * and the child question was not answered yet
	 */
	answer?: string;
	/**
	 * ISO String date format
	 */
	answered_at?: string;
};

export type QuotationConversationMessage = {
	id: string;
	sent_at: Date;
	content: string;

	role: QuotationMessageRole;
};

export enum QuotationMessageRole {
	Agent = 'agent',
	Customer = 'customer',
}

export type QuestionExampleMetadata =
	| {
			kind: 'related_answer';
			question: string;
			answer: string;
	  }
	| {
			kind: 'unrelated_answer';
			question: string;
			answer: string;
			validationMessage: string;
	  };

export type SegmentTranslationAtDb = {
	translation: string;
	language: string;
}[];
