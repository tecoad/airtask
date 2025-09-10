// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
	'@@xstate/typegen': true;
	internalEvents: {
		'done.invoke.flow_agents_create.Creating agent:invocation[0]': {
			type: 'done.invoke.flow_agents_create.Creating agent:invocation[0]';
			data: unknown;
			__tip: 'See the XState TS docs to learn how to strongly type this.';
		};
		'xstate.init': { type: 'xstate.init' };
	};
	invokeSrcNameMap: {
		'Create Agent': 'done.invoke.flow_agents_create.Creating agent:invocation[0]';
	};
	missingImplementations: {
		actions: 'redirectToEdit';
		delays: never;
		guards: never;
		services: 'Create Agent';
	};
	eventsCausingActions: {
		assignUserChoicesToContext: 'userChoicesChanged';
		redirectToEdit: 'done.invoke.flow_agents_create.Creating agent:invocation[0]';
		updateHistory: 'next';
		useLastHistoryContext: 'prev';
	};
	eventsCausingDelays: {};
	eventsCausingGuards: {
		'Last state is "Creation Type"': 'prev';
		'Last state is "Selecting Editing Mode"': 'prev';
		'Last state is "Selecting Service Type"': 'prev';
		'Last state is "Selecting Use Case"': 'prev';
		'editingMode is "Advanced"': 'next';
		'editingMode is "Standard"': 'next';
		'serviceType is "General"': 'next';
		'serviceType is "Objective"': 'next';
		'useCase is "Customer Service"': 'next';
		'useCase is "Other"': 'next';
		'useCase is "Sales"': 'next';
	};
	eventsCausingServices: {
		'Create Agent': 'next';
	};
	matchesStates:
		| 'Agent created'
		| 'Creating agent'
		| 'Creation Type'
		| 'Selecting Editing Mode'
		| 'Selecting Service Type'
		| 'Selecting Use Case';
	tags: never;
}
