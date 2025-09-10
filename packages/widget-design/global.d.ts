declare module '*.svg';
declare module '*.css';

type Main = typeof import('./src/translations/en.json');

type Messages = Main;

declare interface IntlMessages extends Messages {}
