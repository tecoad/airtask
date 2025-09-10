import { Injectable } from '@nestjs/common';
import { CallbackHandlerMethods } from 'langchain/callbacks';
import { DynamicStructuredTool } from 'langchain/tools';
import { CurrencyCode } from 'src/graphql';
import { AccountsService } from 'src/modules/accounts/services/accounts.service';
import { PrismaService } from 'src/modules/common/services/prisma.service';
import { CreditsManagerService } from 'src/modules/subscriptions/services/credits-manager.service';
import { UsersService } from 'src/modules/users/services/users.service';
import { formatCurrency } from 'src/shared/utils/currency';
import * as z from 'zod';

type LoadToolsOptions = {
	waitActionConfirm?: (input: {
		actionName: string;
		input: Record<string, any>;
		runId: string;
	}) => Promise<{
		allowed: boolean;
		reason: 'choice' | 'timeout';
	}>;
	callbacks?: CallbackHandlerMethods[];
	onActionEnd: (name: string, output: any, runId: string) => void;
};

@Injectable()
export class AiAssistantToolsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly creditsManager: CreditsManagerService,
		private readonly accountsService: AccountsService,
		private readonly usersService: UsersService,
	) {}

	private readonly constants = {
		toolsCancelledOutput: 'acao_cancelada',
	};

	nullableSearchToDb(v: any) {
		return v === null ? undefined : v;
	}

	loadTools(opts?: LoadToolsOptions) {
		const { onActionEnd, callbacks } = opts || {};

		return [this.accountTools, this.userTools]
			.flatMap((v) => [...v.bind(this)(opts)])
			.map((v) => {
				const prevFunc = v.func;

				v.func = async (...params) => {
					const output = await prevFunc(...params);

					onActionEnd?.(v.name, output, params[1]!.runId);

					return output;
				};

				if (callbacks) v.callbacks = [...callbacks] as CallbackHandlerMethods[];

				return v;
			});
	}

	/** ACCOUNT TOOLS */
	accountTools(opts?: LoadToolsOptions) {
		const { waitActionConfirm } = opts || {};
		return [
			new DynamicStructuredTool({
				name: 'buscarConta',
				description: 'Busca uma conta (ou "account") pelo ID ou nome',
				func: async (input, runManager) => {
					if (
						[
							input.accountId,
							...(input.accountSearch ? Object.values(input.accountSearch) : [false]),
						].every((v) => !v)
					) {
						return 'Erro de validação: Nenhum parâmetro de busca foi informado.';
					}

					if (waitActionConfirm) {
						const { allowed } = await waitActionConfirm({
							actionName: 'Buscar conta',
							input,
							runId: runManager!.runId,
						});

						if (!allowed) {
							return this.constants.toolsCancelledOutput;
						}
					}

					return JSON.stringify(
						await this.prisma.account.findFirst({
							where: {
								id: this.nullableSearchToDb(input.accountId),
								name: {
									contains: this.nullableSearchToDb(input.accountSearch?.name),
									mode: 'insensitive',
								},
							},
						}),
					);
				},

				schema: z.object({
					accountId: z.number().nullable().optional(),
					accountSearch: z
						.object({
							name: z.string().nullable().optional(),
						})
						.nullable()
						.optional(),
				}),
				metadata: {
					actions: ['delete', 'update'],
				},
			}),
			new DynamicStructuredTool({
				name: 'buscarCreditosDeConta',
				description: 'Busca os créditos de uma conta pelo ID',
				func: async (input) => {
					const account = await this.accountsService.find(input.accountId);

					if (!account) {
						return 'ERRO: Conta não encontrada';
					}

					if (!account.currency) {
						return 'ERRO: A conta não possui uma moeda definida.';
					}

					const { balance } = await this.creditsManager.totalBalanceForAccount(
						input.accountId,
					);
					return formatCurrency(balance.toNumber(), account.currency as CurrencyCode);
				},
				schema: z.object({
					accountId: z.number(),
				}),
			}),
		];
	}

	/** USER TOOLS */
	userTools(opts?: LoadToolsOptions) {
		const { waitActionConfirm } = opts || {};
		return [
			new DynamicStructuredTool({
				name: 'buscarUsuario',
				description: 'Busca um usuário por ID, nome ou email.',
				func: async (input) => {
					if (
						[
							input.userId,
							...(input.userSearch ? Object.values(input.userSearch) : [false]),
						].every((v) => !v)
					) {
						return 'Erro de validação: Nenhum parâmetro de busca foi informado.';
					}

					return JSON.stringify(
						await this.prisma.user.findFirst({
							where: {
								id: this.nullableSearchToDb(input.userId),
								first_name: {
									contains: this.nullableSearchToDb(input.userSearch?.first_name),
									mode: 'insensitive',
								},
								last_name: {
									contains: this.nullableSearchToDb(input.userSearch?.last_name),
									mode: 'insensitive',
								},
								email: {
									contains: this.nullableSearchToDb(input.userSearch?.email),
									mode: 'insensitive',
								},
							},
						}),
					);
				},
				schema: z.object({
					userId: z.number().nullable().optional(),
					userSearch: z
						.object({
							first_name: z.string().nullable().optional(),
							last_name: z.string().nullable().optional(),
							email: z.string().nullable().optional(),
						})
						.nullable()
						.optional(),
				}),
			}),

			new DynamicStructuredTool({
				name: 'enviarEmailDeRecuperacaoDeSenhaParaUsuario',
				description: 'Envia um email de recuperação de senha para um usuário pelo ID',
				func: async (input, runManager) => {
					if (waitActionConfirm) {
						const { allowed } = await waitActionConfirm({
							actionName: 'Enviar email de recuperação de senha para usuário',
							input,
							runId: runManager!.runId,
						});

						if (!allowed) {
							return this.constants.toolsCancelledOutput;
						}
					}

					const user = await this.usersService.findPublic(input.userId);

					if (!user) {
						return 'ERRO: Usuário não encontrado';
					}

					await this.usersService.requestPasswordReset(user.email);

					return 'Email enviado com sucesso';
				},

				schema: z.object({
					userId: z.number(),
				}),
				metadata: {
					actions: ['delete', 'update'],
				},
			}),
		];
	}
}
