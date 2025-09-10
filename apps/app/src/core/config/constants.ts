export const CONSTANTS = Object.seal({
	whatsapp_redirect_by_number: (number: string) => `https://wa.me/${number}`,
	email_redirect_by_email: (email: string) => `mailto:${email}`,

	queryParams: {
		createNewDefaultOpen: 'createNew',
		redirect: 'redirect',
	},
});
