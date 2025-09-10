declare module 'react-gtm-module-custom-domain';

// Use type safe message keys with `next-intl`
type Messages = typeof import('./src/translations/en.json') &
	typeof import('../../packages/widget-design/src/translations/en.json');
declare interface IntlMessages extends Messages {}
