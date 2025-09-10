export type TwilioRecordingStatusCallbackPayload = {
	RecordingSource: string;
	RecordingTrack: string;
	RecordingSid: string;
	RecordingUrl: string;
	RecordingStatus: string;
	RecordingChannels: string;
	ErrorCode: string;
	CallSid: string;
	RecordingStartTime: string;
	AccountSid: string;
	RecordingDuration: string;
};

export type TwilioCallStatusCallbackPayload = {
	Called: string;
	ToState: string;
	CallerCountry: string;
	Direction: string;
	Timestamp: string;
	CallbackSource: string;
	CallerState: string;
	ToZip: string;
	SequenceNumber: string;
	CallSid: string;
	To: string;
	CallerZip: string;
	ToCountry: string;
	CalledZip: string;
	ApiVersion: string;
	CalledCity: string;
	CallStatus:
		| 'queued'
		| 'busy'
		| 'failed'
		| 'no-answer'
		| 'initiated'
		| 'ringing'
		| 'in-progress'
		| 'completed';
	From: string;
	AccountSid: string;
	CalledCountry: string;
	CallerCity: string;
	ToCity: string;
	FromCountry: string;
	Caller: string;
	FromCity: string;
	CalledState: string;
	FromZip: string;
	FromState: string;
	StirStatus?: 'C';
	SipResponseCode?: string;
	Duration?: string;
	CallDuration?: string;
};
