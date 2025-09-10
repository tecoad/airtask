import { ENV } from '@/core/config/env';
import axios from 'axios';

export const api = axios.create({
	baseURL: ENV.API.rest_base_url,
});
