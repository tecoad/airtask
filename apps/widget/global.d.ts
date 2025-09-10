declare module 'react-gtm-module-custom-domain';

// Use type safe message keys with `next-intl`
type i18n = typeof import('./src/translations/en/main.json');
type WidgetPackage = typeof import('../../packages/widget/src/translations/en.json');

type Messages = i18n & WidgetPackage;
declare interface IntlMessages extends Messages {}
