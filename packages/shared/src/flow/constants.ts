export const FLOW_CALL_HANDLER_PATH = '/call-handler';

export const FLOW_CALL_HANDLER_XML_PATH = [
	FLOW_CALL_HANDLER_PATH,
	'/xml/:interactionId',
] as const;

export const GENERATE_FIRST_TALK_IN_INTERACTION = [
	FLOW_CALL_HANDLER_PATH,
	'/generate-first-talk/:interactionId',
] as const;
