'use client';

import { assign, createMachine } from 'xstate';

import { FlowAgentEditorType, FlowAgentFragment } from '@/core/shared/gql-api-schema';
import { Typegen0 as MachineTypes } from './machine.typegen';

export type AvailableStates = MachineTypes['matchesStates'];

export enum AgentCreateUseCase {
  Sales = 'sales',
  CustomerService = 'customer-service',
  Other = 'other',
}

export enum AgentCreateEditingMode {
  Standard = 'standard',
  Advanced = 'advanced',
}

export enum AgentCreateServiceType {
  General = 'general',
  Objective = 'objective',
}

export enum AgentCreationType {
  Scratch = 'scratch',
  AI = 'ai',
}

type Context = {
  editor?: FlowAgentEditorType;
  userChoices: {
    useCase?: AgentCreateUseCase;
    editingMode?: AgentCreateEditingMode;
    serviceType?: AgentCreateServiceType;
    creationType?: AgentCreationType;
  };
  history: {
    userChoices: UserChoicesContext;
    state: AvailableStates;
  }[];
};
export type UserChoicesContext = Context['userChoices'];

type Events =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'userChoicesChanged'; values: Partial<UserChoicesContext> };

export const getMachine = () => {
  const machine = createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QDMA2B7A7gfQIYwDsAXWbAYwCcxciwA6AZTFTDKIEsCoACAVVjDcAwrgEBiAK4CKQgBbp2ZOHNxdIAbQAMAXUSgADuljsO6AnpAAPRABYATABoQAT0QBWOwHY6AZhsAOHwA2f00ARh9-Gx83AF9YpzQsPEIScioaeiYWNk4efkERcQIwSyItXSQQQ2NTcyrrBB9NbzcbEP8ATn9-ILD+xxdEfzC6N00Jn36gn1mg7vjEjBx8MGJSSmpaRmZWDi4+AWFRMDESsvUwyoMjE3YzC0bm1vae7t7+sMHXBCDNGzodjcMU0nQmnk8-TiCRASRWqQ2GW22T2eUOhROZ1K5Ts12qtzqj0QzzGry6PT6AycPzCELoNmBYSinhC3TCmh8i1hyxSazSm0yOxy+x4TAoADdFIIACrOfSnKRgGTyKWwFRqCAVCw1O4PBqITw+VpTOwRTp9PrtanuOydOiaLzhFn9HxAuxcuG89bpLZZXa5A5iyVKbiy+VifRUcVaqo6wn6pp2AHszrBTpteZ2Oz+a0Icb+XyTNxtB2aIKeaFLZKrb0C5H+kXcINS0Ny06RsDRq7agn3eqgRpBGZ0brRQJjkZuXPRHz2w2daItTrZ90wz01-lIv3CtHNkNh9tR9S4nu1PtEhDsll0IJJzrzlquoK5txfOiBP4hTyBUFfD08jdEV9IVUUDJVgxlNsIyPHw8Tjc8EyvIIbzvB9DTsZ8hkTTQR1tZ03EhUJmiCf9qwRH1BRRANRXAlsDyxC4dFPXV+ysRAkJQmx7x8MF0Mwn4-gLb9lyzSJ-ENDxSPhPkgMohtd1o-coPOcpu1jXs9QHdiWmQ28uLQp9c08f46E8ewjTcToFyNTowikr1N2AqjGwAUQgO4DgAWXQCAFWkOQFCUNVZFUGBNSY9Sz00tjLzcQJ33LOxgnQ7oHVzPoC1BWzwmiJl5k8ezAIo+sdwONyPJ4bzfOgzsYxuKLWMaF0cNBCy7HCNwghsDlc3ZWZTM0QJ7xZcSgmLQryLrbdQJ4crGyqw9arU+qWIvK9vFdUJzWCNp2pzLCbDCZCeltMJXwhGwbEhCaZOK6bqO4Oa0QWmroxPSLVsQ8Y7XNUbLJaYEkpfLM6DCBkF2-DCswIm7ay3ECHqeryfMW6NYOY+MtMvMFZxNYtPF4+d0u6XwgUhMHIjGszYccuTStm9z5pRhjygilbMZisIcd8L58cJnijIXQFv2-SzjOMzRK25MjbqmughCRPtW3DRVlUC5QQo1Or8Qai8kqiHmkoCNpzX47SunfWY7y+Qajpp2TtgVrYlfojtozZnXPqxrnOtMkZaW-Dpzt6gPQaifxi3Nfpek5NcAMm+GnZoF2oLdy44I0xr2LBAEOpCDkxsCSJcy6HCkryyWHTMyJ7bu+XFbMZXUePDPdcQ7m8YI-nOnSh1fE8DC0zLS1VyraS4eApO6ib171HRj6OcaJLghvTqudpP4zJsXMrNnHoJiOy6zvJ2u5anlPwxU7X4Oipfy1aM7X0iEEeh8EPDRHFkPGCIugSl9cE6TwbgQGeV9lqe0XogDCdJXzFgiIEfMgReotEyklU6ExuqhBInHGWE9BTnwOBuMQEAzD0E4OKdAABregADZaJ0VoQ1ICByHoDIMnMwFRr6ZwvK6bMYcIRQmLMREO8V+j3gCIdKGSZ4gwgICjeAVRaF4NoBjBCWMAC0ZsEDqLcCOKy95Jygkuv4Lwp94bOTRAUY4AhVG30QOWekppRrggCOWLRt4CzNDOqaPoC5xL-3jnQpy8kwISjom2WxWcEAVhasZKYpYGQDx7lhW8P1QiglNDOEIscx4OQdvdVyjNnoo0iWtSyujfoEx-O0AiWiB6jEllmQ05ZJjBDMUA52jcDylITEmW0gImQD0GpCSk28sJiJwoHAITIJhlkGu0-BDCeAbh6VjLxuj-jzD0lmc06YQ5xRvFzCs95aTiSBAs7YABBVI3ApoQFWTFPwXNATcUGt1YaBF9kbXyl1JKIRvEyNiEAA */
      id: 'flow_agents_create',
      /**NOTE: Whenever this changes, the initial state at history MUST be changed */
      initial: 'Selecting Use Case',
      context: {
        userChoices: {},
        history: [
          {
            userChoices: {},
            state: 'Selecting Use Case',
          },
        ],
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      schema: {
        events: {} as Events,
        context: {} as Context,
        services: {} as {
          'Create Agent': { data: FlowAgentFragment };
        },
      },
      states: {
        ['Selecting Use Case']: {
          on: {
            userChoicesChanged: {
              actions: 'assignUserChoicesToContext',
            },
            next: [
              {
                target: 'Selecting Editing Mode',
                cond: 'useCase is "Sales"',
                actions: 'updateHistory',
              },
              {
                target: 'Selecting Service Type',
                cond: 'useCase is "Customer Service"',
                actions: 'updateHistory',
              },
              {
                target: 'Selecting Editing Mode',
                cond: 'useCase is "Other"',
                actions: 'updateHistory',
              },
            ],
          },
        },

        ['Selecting Service Type']: {
          on: {
            userChoicesChanged: {
              actions: 'assignUserChoicesToContext',
            },
            prev: [
              {
                target: 'Selecting Use Case',
                cond: 'Last state is "Selecting Use Case"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Selecting Service Type',
                cond: 'Last state is "Selecting Service Type"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Selecting Editing Mode',
                cond: 'Last state is "Selecting Editing Mode"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Creation Type',
                cond: 'Last state is "Creation Type"',
                actions: ['useLastHistoryContext'],
              },
            ],
            next: [
              {
                target: 'Selecting Editing Mode',
                cond: 'serviceType is "General"',
                actions: 'updateHistory',
              },
              {
                target: 'Selecting Editing Mode',
                cond: 'serviceType is "Objective"',
                actions: 'updateHistory',
              },
            ],
          },
        },

        ['Selecting Editing Mode']: {
          on: {
            userChoicesChanged: {
              actions: 'assignUserChoicesToContext',
            },
            prev: [
              {
                target: 'Selecting Use Case',
                cond: 'Last state is "Selecting Use Case"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Selecting Service Type',
                cond: 'Last state is "Selecting Service Type"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Selecting Editing Mode',
                cond: 'Last state is "Selecting Editing Mode"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Creation Type',
                cond: 'Last state is "Creation Type"',
                actions: ['useLastHistoryContext'],
              },
            ],
            next: {
              target: 'Creation Type',
              actions: 'updateHistory',
            },
          },
        },

        ['Creation Type']: {
          on: {
            userChoicesChanged: {
              actions: 'assignUserChoicesToContext',
            },

            prev: [
              {
                target: 'Selecting Use Case',
                cond: 'Last state is "Selecting Use Case"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Selecting Service Type',
                cond: 'Last state is "Selecting Service Type"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Selecting Editing Mode',
                cond: 'Last state is "Selecting Editing Mode"',
                actions: ['useLastHistoryContext'],
              },
              {
                target: 'Creation Type',
                cond: 'Last state is "Creation Type"',
                actions: ['useLastHistoryContext'],
              },
            ],

            next: [
              {
                target: 'Creating agent',
                cond: 'editingMode is "Standard"',
                actions: [
                  'updateHistory',
                  assign({
                    editor: FlowAgentEditorType.Standard,
                  }),
                ],
              },
              {
                target: 'Creating agent',
                cond: 'editingMode is "Advanced"',
                actions: [
                  'updateHistory',
                  assign({
                    editor: FlowAgentEditorType.Advanced,
                  }),
                ],
              },
            ],
          },
        },

        'Creating agent': {
          invoke: {
            src: 'Create Agent',
            onDone: {
              target: 'Agent created',
            },
          },
        },
        'Agent created': {
          type: 'final',
          entry: 'redirectToEdit',
        },
      },
      predictableActionArguments: false,
      preserveActionOrder: true,
    },
    {
      actions: {
        updateHistory: assign((ctx, _, meta) => {
          const { history, ...rest } = ctx;

          return {
            ...rest,
            history: [
              ...history,
              {
                userChoices: rest.userChoices,
                state: meta.state?.value as AvailableStates,
              },
            ],
          };
        }),
        useLastHistoryContext: assign((ctx, evt) => {
          const [last] = ctx.history.splice(-1);

          return {
            userChoices: last.userChoices,
            history: ctx.history,
          };
        }),
        assignUserChoicesToContext: assign((ctx, evt) => {
          return {
            userChoices: {
              ...ctx.userChoices,
              ...evt.values,
            },
          };
        }),
      },
      services: {},
      guards: {
        'useCase is "Sales"': (context) =>
          context.userChoices.useCase === AgentCreateUseCase.Sales,
        'useCase is "Customer Service"': (context) =>
          context.userChoices.useCase === AgentCreateUseCase.CustomerService,
        'useCase is "Other"': (context) =>
          context.userChoices.useCase === AgentCreateUseCase.Other,

        'serviceType is "General"': (context, event) =>
          context.userChoices.serviceType === AgentCreateServiceType.General,
        'serviceType is "Objective"': (context, event) =>
          context.userChoices.serviceType === AgentCreateServiceType.Objective,

        'editingMode is "Advanced"': (context) =>
          context.userChoices.editingMode === AgentCreateEditingMode.Advanced,

        'editingMode is "Standard"': (context) =>
          context.userChoices.editingMode === AgentCreateEditingMode.Standard,

        'Last state is "Creation Type"': (context) =>
          context.history[context.history.length - 1].state === 'Creation Type',
        'Last state is "Selecting Editing Mode"': (context) =>
          context.history[context.history.length - 1].state === 'Selecting Editing Mode',
        'Last state is "Selecting Service Type"': (context) =>
          context.history[context.history.length - 1].state === 'Selecting Service Type',
        'Last state is "Selecting Use Case"': (context) =>
          context.history[context.history.length - 1].state === 'Selecting Use Case',
      },
      delays: {},
    },
  );

  return machine;
};
