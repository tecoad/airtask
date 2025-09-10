export type FlowQueueDataObject = {
	handleCampaignJob?: {
		added_at: string;
		repeat: {
			key: string;
		};
	};
};

export type GetLocalInfoReturn = {
	time?: {
		// zone: string;
		hour: string;
		mins: string;
		// meridian: boolean;
		// display: string;
	};
};
