import { JobStatus } from 'bull';

export const ALL_JOBS_STATUS: JobStatus[] = [
	'active',
	'completed',
	'delayed',
	'failed',
	'paused',
	'waiting',
];
