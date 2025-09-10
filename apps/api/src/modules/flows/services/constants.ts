export const flowInteractionCacheKey = ({ interactionId }: { interactionId: string }) =>
	`flow-interaction-${interactionId}-data`;

export const flowInteractionFirstAudioCacheKey = ({
	interactionId,
}: {
	interactionId: string;
}) => `flow-interaction-${interactionId}-first-audio`;
