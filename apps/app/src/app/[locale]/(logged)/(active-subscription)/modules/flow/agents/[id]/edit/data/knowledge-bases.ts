export interface Base<Type = string> {
	id: string;
	name: string;
	questions: number;
}

export const bases: Base[] = [
	{
		id: '29f4c7e6-4d0b-478d-8b3a-6e1a94f9cd0c',
		name: 'Sample Element D',
		questions: 10,
	},
	{
		id: 'd65f9c18-8e42-49a7-af93-1a2b6e3450ea',
		name: 'Lorem Ipsum Product',
		questions: 9,
	},
	{
		id: '6a7e13c9-492f-496b-8cfd-214c795ce48b',
		name: 'Example Part 2',
		questions: 8,
	},
	{
		id: '823b169f-36ca-46d6-9d1f-17e1c78b24e3',
		name: 'Sample Component C',
		questions: 1,
	},
	{
		id: 'ac6e850a-cb47-4c57-98cc-9e00f7c738f2',
		name: 'Test Product Z',
		questions: 5,
	},
];
