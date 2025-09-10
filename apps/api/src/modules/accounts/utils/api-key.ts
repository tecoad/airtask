import { v4 } from 'uuid';

export const generateAccountApiKey = () => {
	return v4();
};
