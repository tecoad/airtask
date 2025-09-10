export type UserJwtPayload = {
	sessionId: string;
	id: number;
	email: string;
	authenticatedAt: string;
} & (
	| {
			simulated?: false;
	  }
	| {
			simulated: true;
			// Original user data
			originalAdmin: {
				// admin ID
				id: number;
				// admin original JWT
				token: string;
			};
	  }
);
