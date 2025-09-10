export const FLOW_CALL_WEBHOOKS_PATH = '/flow-call-webhooks';

export const FLOW_CALL_RECORDING_STATUS_CALLBACK_PATH = [
	FLOW_CALL_WEBHOOKS_PATH,
	'/recording-status-callback',
] as const;

export const FLOW_CALL_STATUS_CALLBACK_PATH = [
	FLOW_CALL_WEBHOOKS_PATH,
	'/status-callback',
] as const;
