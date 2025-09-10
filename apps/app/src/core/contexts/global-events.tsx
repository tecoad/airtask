'use client';
import { GenericModuleData } from '@/lib/modules/hooks';
import { ReactNode, createContext, useContext } from 'react';
import {
	AccountApiKeyFragment,
	AccountUsageKind,
	FlowAgentFragment,
	KnowledgeBaseFragment,
} from '../shared/gql-api-schema';

export enum EntityNameEventOption {
	agent,
	knowledgeBase,
	accountApiKey,
}

export type GlobalEvents = {
	moduleDeleted: {
		moduleName: AccountUsageKind;
		instanceId: string | number;
	};
	moduleCreated: {
		moduleName: AccountUsageKind;
		data: GenericModuleData;
	};
	moduleUpdated: GlobalEvents['moduleCreated'];

	entityCreated:
		| {
				name: EntityNameEventOption.agent;
				data: FlowAgentFragment;
		  }
		| {
				name: EntityNameEventOption.accountApiKey;
				data: AccountApiKeyFragment;
		  }
		| {
				name: EntityNameEventOption.knowledgeBase;
				data: KnowledgeBaseFragment;
		  };
	entityUpdated: GlobalEvents['entityCreated'];
	entityDeleted: {
		name: EntityNameEventOption;
		id: string | number;
	};

	'data-table.allFiltersRemoved': undefined;
};

const GlobalEventContext = createContext<{
	emit: <T extends keyof GlobalEvents>(eventName: T, data: GlobalEvents[T]) => void;
	subscribe: <T extends keyof GlobalEvents>(
		eventName: T,
		callback: (data: GlobalEvents[T]) => void,
	) => () => void;
}>({} as any);

export function GlobalEventProvider({ children }: { children: ReactNode }) {
	const eventEmitter = {
		listeners: {} as Record<string, ((data: any) => void)[]>,
		subscribe: <
			T extends keyof GlobalEvents,
			EntityName extends EntityNameEventOption | unknown = unknown,
		>(
			eventName: T,
			listener: (data: GlobalEvents[T]) => void,
		) => {
			if (!eventEmitter.listeners[eventName]) {
				eventEmitter.listeners[eventName] = [];
			}
			eventEmitter.listeners[eventName].push(listener);

			return () => {
				eventEmitter.listeners[eventName] = eventEmitter.listeners[eventName].filter(
					(l) => l !== listener,
				);
			};
		},
		emit: <T extends keyof GlobalEvents>(eventName: T, data: GlobalEvents[T]) => {
			if (eventEmitter.listeners[eventName]) {
				eventEmitter.listeners[eventName].forEach((listener) => {
					listener(data);
				});
			}
		},
	};

	return (
		<GlobalEventContext.Provider value={eventEmitter}>
			{children}
		</GlobalEventContext.Provider>
	);
}

export function useGlobalEvents() {
	const context = useContext(GlobalEventContext);

	return context;
}
