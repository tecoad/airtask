import { AxiosError } from 'axios';

export const isAxiosError = (error: any): error is AxiosError => {
	return error.isAxiosError;
};

export const mapAxiosErrorToLog = (error: AxiosError) => ({
	path: error.config?.url,
	payload: error.config?.data,
	statusCode: error.response?.status,
	response: error.response?.data,
});
