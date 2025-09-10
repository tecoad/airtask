import axios from 'axios';

export const aiApi = axios.create({
	baseURL: process.env.AI_API_URL,
});
