import { FlowInteractionStatus } from 'src/shared/types/db';
import { TwilioCallStatusCallbackPayload } from './types';

export const normalizeCallStatus = (
	status: TwilioCallStatusCallbackPayload['CallStatus'],
): FlowInteractionStatus => {
	switch (status) {
		case 'queued':
		case 'initiated':
			return FlowInteractionStatus.Requested;
		case 'ringing':
			return FlowInteractionStatus.Ringing;
		case 'in-progress':
			return FlowInteractionStatus.InProgress;
		case 'busy':
		case 'failed':
		case 'no-answer':
			return FlowInteractionStatus.NotAnswered;
		case 'completed':
			return FlowInteractionStatus.Finished;
	}
};
