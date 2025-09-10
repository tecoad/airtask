export const types = ['Book Appointment', 'Live Transfer', 'Custom'] as const;

export type ActionType = (typeof types)[number];

export interface Action<Type = string> {
	id: string;
	name: string;
	trigger: string;
	type: Type;
}

export const actions: Action<ActionType>[] = [
	{
		id: 'c305f976-8e38-42b1-9fb7-d21b2e34f0da',
		name: 'custom-action-1',
		type: 'Custom',
		trigger: 'Lorem ipsum dolor',
	},
	{
		id: 'c305f976-8e38-42b1-9fb7-d2123',
		name: 'custom-action-2',
		type: 'Custom',
		trigger: 'Lorem ipsum dolor 2',
	},
];
