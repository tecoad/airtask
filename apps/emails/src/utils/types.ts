import { LanguageCode } from '../translations';

export type WithLanguageCode<D extends Record<string, any> = object> = D & {
	languageCode: LanguageCode;
};

export type EmailTemplateFunction<D extends Record<string, any>> = {
	template: (data: WithLanguageCode<D>) => JSX.Element;
	getSubject: (data: WithLanguageCode<D>) => string;
	defaultProps?: Partial<WithLanguageCode<D>>;
};
