import { BadRequestException, ValidationPipeOptions } from '@nestjs/common';
import StatusCode from 'http-status-codes';
export const validationPipeOptions: ValidationPipeOptions = {
	exceptionFactory: (errors) => {
		return new BadRequestException({
			statusCode: StatusCode.BAD_REQUEST,
			message: 'Bad request',
			errors: [
				{
					code: 'VALIDATION_ERROR',
					fields: errors.map(({ constraints, ...rest }) => ({
						...rest,
						constrains: Object.values(constraints!),
					})),
				},
			],
		});
	},
};
