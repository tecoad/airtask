import { api } from '@/core';
import { ENV } from '@/core/config/env';
import { useState } from 'react';
import { useUser } from '../user';

export const useHelpForm = () => {
	const [ticketId, setTicketId] = useState<string>();
	const { user } = useUser();

	const exec = async ({
		message,
		subject,
		email,
	}: {
		subject: string;
		message: string;
		email: string;
	}) => {
		if (!user) return;

		const { data } = await api.post<{
			ticketId: string;
		}>('support/ticket', {
			autoReply: true,
			subject: `Formulário Site: ${subject}`,
			customer: {
				email,
				firstName: user.first_name,
				lastName: user.last_name,
			},
			mailboxId: +ENV.HELP.mailbox_id!,
			type: 'chat',
			status: 'active',
			threads: [
				{
					type: 'customer',
					customer: {
						email,
					},
					text: message,
				},
			],
			tags: [],
		});

		setTicketId(data.ticketId);
	};

	return { exec, ticketId };
};
